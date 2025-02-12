/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation } from "@tanstack/react-query";
import {
  createContext,
  FC,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { FormProvider } from "react-hook-form";
import { Outlet, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  AddPrevQuestions,
  AddQuiz,
  PreQuiz,
  QuizInvitation,
  useAddQuiz,
} from "../Components";
import { AddQuizQuestions } from "../Components/Dashboard/Components/AddQuizQuestions";
import { useSocket } from "../Hooks";
import { authAxios } from "../http";

export const SocketProvider: FC<PropsWithChildren> = ({ children }) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const userId = localStorage.getItem("userId");
  const [sp, ssp] = useSearchParams();
  const { form } = useAddQuiz();
  const navigate = useNavigate();
  const {
    onIncomingInvite,
    onInviteAccepted,
    onInQuiz,
    onRemovePreQuiz,
    handleEmitSocketMessages,
  } = useSocket();

  useEffect(() => {
    if (userId) {
      const ws = new WebSocket(`ws://localhost:8080/ws/${userId}`);
      ws.onopen = () => {
        console.log("WebSocket connection established.");
        toast.success("WebSocket connection established.");
      };
      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
      };
      ws.onmessage = (message) => {
        const data: ISendSocketMessageProps = JSON.parse(message.data);
        ws.onerror = (error) => {
          console.error("WebSocket error:", error);
        };

        switch (data.type) {
          case "INVITE_INCOMING": {
            onIncomingInvite({ data });
            break;
          }
          case "INVITE_ACCEPTED": {
            onInviteAccepted({ data, form });
            break;
          }
          case "INVITE_DECLINED": {
            toast.error(`Invite declined by ${data.payload.invitedUsername}`);
            break;
          }
          case "NOT_FOUND": {
            toast.error(`User not online`);
            break;
          }
          case "IN_QUIZ": {
            onInQuiz({ data, form });
            break;
          }
          case "REMOVE_PRE_QUIZ": {
            onRemovePreQuiz();
            break;
          }
          case "QUIZ_STARTED": {
            navigate(`/play/${data.payload.quizId}/${data.payload.quizName}`);
            break;
          }
          default: {
            toast.error(`Unknown message type`);
            break;
          }
        }
      };
      setSocket(ws);
    }
  }, [userId]);

  const emitSocketMessage = useCallback(
    ({ type, payload }: ISendSocketMessageProps) => {
      if (socket) {
        socket.send(
          JSON.stringify({
            type,
            payload,
          })
        );
      }
    },
    [socket]
  );

  const handleSendSocketMessage = useCallback(
    ({
      type,
      externalPayloadParams,
    }: {
      type: ISendSocketMessageProps["type"];
      externalPayloadParams?: any;
    }) => {
      handleEmitSocketMessages({
        emitSocketMessage,
        type,
        externalPayloadParams,
      });
    },
    [emitSocketMessage, handleEmitSocketMessages]
  );

  const addQuestionsInQuizMutation = useMutation({
    mutationFn: (data: { quizId: string; payload: string[] }) =>
      authAxios.put(`/api/quiz/${data.quizId}/questions`, {
        quizzes: data.payload,
      }),
  });
  const createQuizMutation = useMutation({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mutationFn: (data: any) => authAxios.post("/api/quiz", data),
  });

  const handleCreateQuiz = form.handleSubmit((values) => {
    const newQuestions = values.questions.filter((q) => !q.questionId);
    const oldQuestions = values.questions
      .filter((q) => !!q.questionId)
      .map((q) => {
        if (q.questionId !== undefined) {
          return q.questionId;
        }
        return "";
      });

    const newQuiz = {
      quizName: values.name,
      questions: newQuestions,
      users: values.players.map((p) => p.userId),
      totalQues: newQuestions.length,
    };
    createQuizMutation.mutate(newQuiz, {
      onSuccess: (data) => {
        toast.success("Quiz Created");
        form.reset();
        handleEmitSocketMessages({
          emitSocketMessage,
          type: "QUIZ_STARTED",
          externalPayloadParams: {
            quizId: data.data.quizId,
            users: form.getValues("players").map((p) => ({
              userId: p.userId,
              username: p.username,
              score: 0,
            })),
          },
        });
        if (oldQuestions.length === 0) return;
        addQuestionsInQuizMutation.mutate({
          quizId: data.data.quizId,
          payload: oldQuestions,
        });
      },
    });
  });

  const value = useMemo(
    () => ({
      socket,
      handleSendSocketMessage,
    }),
    [socket, handleSendSocketMessage]
  );
  return (
    <SocketContext.Provider value={value}>
      {children}
      <Outlet />

      <FormProvider {...form}>
        <AddQuiz
          open={!!sp.get("addQuizOpen")}
          handleClose={() => {
            handleEmitSocketMessages({
              emitSocketMessage,
              type: "REMOVE_PRE_QUIZ",
            });
          }}
          onSubmit={() => handleCreateQuiz()}
          onAddQuestions={() => {
            const params = new URLSearchParams(sp);
            params.set("addQuizQuestionsOpen", "true");
            ssp(params.toString());
          }}
        />
        <AddQuizQuestions
          open={!!sp.get("addQuizQuestionsOpen")}
          handleClose={() => {
            const params = new URLSearchParams(sp);
            params.delete("addQuizQuestionsOpen");
            ssp(params.toString());
          }}
        />
        <QuizInvitation
          open={
            !!sp.get("quizName") &&
            !!sp.get("invitedBy") &&
            !!sp.get("invitedById")
          }
          handleAccept={() => {
            handleEmitSocketMessages({
              emitSocketMessage,
              type: "INVITE_ACCEPTED",
            });
          }}
          handleClose={() => {
            const params = new URLSearchParams(sp);
            params.delete("quizName");
            params.delete("invitedBy");
            params.delete("invitedById");
            ssp(params.toString());
          }}
          handleDecline={() => {
            handleEmitSocketMessages({
              emitSocketMessage,
              type: "INVITE_DECLINED",
            });
          }}
        />

        <AddPrevQuestions
          open={!!sp.get("addingPrevQues")}
          onClose={() => {
            const params = new URLSearchParams(sp);
            params.delete("addingPrevQues");
            ssp(params.toString());
          }}
        />
        <PreQuiz open={!!sp.get("inPreQuiz")} />
      </FormProvider>
    </SocketContext.Provider>
  );
};

const SocketContext = createContext<ISocketProviderProps | null>(null);

export const useSocketProvider = () => {
  const data = useContext(SocketContext);
  return data as ISocketProviderProps;
};

interface ISocketProviderProps {
  socket: WebSocket | null;
  handleSendSocketMessage: ({
    type,
    externalPayloadParams,
  }: {
    type: ISendSocketMessageProps["type"];
    externalPayloadParams?: any;
  }) => void;
}

export interface ISendSocketMessageProps {
  type:
    | "MESSAGE"
    | "INVITE_SENT"
    | "INVITE_ACCEPTED"
    | "INVITE_DECLINED"
    | "INVITE_INCOMING"
    | "NOT_FOUND"
    | "PRE_QUIZ"
    | "REMOVE_PRE_QUIZ"
    | "IN_QUIZ"
    | "QUIZ_STARTED";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: any;
}
