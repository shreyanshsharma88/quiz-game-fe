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
import { Outlet, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  AddPrevQuestions,
  AddQuiz,
  PreQuiz,
  QuizInvitation,
  useAddQuiz,
} from "../Components";
import { AddQuizQuestions } from "../Components/Dashboard/Components/AddQuizQuestions";
import { useGetUser } from "../Hooks";
import { useMutation } from "@tanstack/react-query";
import { authAxios } from "../http";

export const SocketProvider: FC<PropsWithChildren> = ({ children }) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const userId = localStorage.getItem("userId");
  const [sp, ssp] = useSearchParams();
  const { form } = useAddQuiz();
  const { getUserQuery } = useGetUser();

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
            toast.info(`Incoming invite from ${data.payload.username}`);
            const params = new URLSearchParams(sp);
            params.set("quizName", data.payload.quizName);
            params.set("invitedBy", data.payload.username);
            params.set("invitedById", data.payload.invitedByUserId);
            ssp(params.toString());
            break;
          }
          case "INVITE_ACCEPTED": {
            toast.success(`New User Joined`);
            form.setValue("players", data.payload.users);
            if (data.payload.creatorId !== localStorage.getItem("userId")) {
              ssp({
                inPreQuiz: "true",
                creatorId: data.payload.creatorId,
              });
            }
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
            if (data.payload.creatorId != localStorage.getItem("userId")) {
              ssp({
                inPreQuiz: "true",
                creatorId: data.payload.creatorId,
              });
            }
            form.setValue("players", data.payload.users);
            break;
          }
          case "REMOVE_PRE_QUIZ": {
            const params = new URLSearchParams(sp);
            params.delete("inPreQuiz");
            params.delete("creatorId");
            ssp(params.toString());
            toast.error("Quiz Cancelled by creator");
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

  const handleSendSocketMessage = useCallback(
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

  const addQuestionsInQuizMutation = useMutation({
    mutationFn: (data: { quizId: string; payload: string[] }) =>
      authAxios.put(`/api/quiz/${data.quizId}`, { quizzes: data.payload }),
  });
  const createQuizMutation = useMutation({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mutationFn: (data: any) => authAxios.post("/api/quiz", data),
    onSuccess: () => {
      toast.success("Quiz Created");
      form.reset();
      // fire socket event
    },
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
            handleSendSocketMessage({
              type: "REMOVE_PRE_QUIZ",
              payload: {
                userId: localStorage.getItem("userId"),
              },
            });
            const params = new URLSearchParams(sp);
            params.delete("addQuizOpen");
            ssp(params.toString());
            form.reset();
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
            handleSendSocketMessage({
              type: "INVITE_ACCEPTED",
              payload: {
                invitedByUserId: sp.get("invitedById"),
                username: sp.get("invitedBy"),
                quizName: sp.get("quizName"),
                invitedUserId: localStorage.getItem("userId"),
                invitedUsername: getUserQuery.data?.data.username,
              },
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
            handleSendSocketMessage({
              type: "INVITE_DECLINED",
              payload: {
                invitedByUserId: sp.get("invitedById"),
                username: sp.get("invitedBy"),
                quizName: sp.get("quizName"),
                invitedUserId: localStorage.getItem("userId"),
                invitedUsername: getUserQuery.data?.data.username,
              },
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
  handleSendSocketMessage: (props: ISendSocketMessageProps) => void;
}

interface ISendSocketMessageProps {
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
