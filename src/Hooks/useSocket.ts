/* eslint-disable @typescript-eslint/no-explicit-any */
import { useSearchParams } from "react-router-dom";
import { ISendSocketMessageProps } from "../Providers";
import { toast } from "react-toastify";
import { useGetUser } from "./useGetUser";

export const useSocket = () => {
  const [sp, ssp] = useSearchParams();
  const { getUserQuery } = useGetUser();

  const username = getUserQuery.data?.data.username;

  const onIncomingInvite = ({ data }: { data: ISendSocketMessageProps }) => {
    toast.info(`Incoming invite from ${data.payload.username}`);
    const params = new URLSearchParams(sp);
    params.set("quizName", data.payload.quizName);
    params.set("invitedBy", data.payload.username);
    params.set("invitedById", data.payload.invitedByUserId);
    ssp(params.toString());
  };

  const onInviteAccepted = ({
    data,
    form,
  }: {
    data: ISendSocketMessageProps;
    form: any;
  }) => {
    toast.success(`New User Joined`);
    form.setValue("players", data.payload.users);
    if (data.payload.creatorId !== localStorage.getItem("userId")) {
      ssp({
        inPreQuiz: "true",
        creatorId: data.payload.creatorId,
      });
    }
  };

  const onInQuiz = ({
    data,
    form,
  }: {
    data: ISendSocketMessageProps;
    form: any;
  }) => {
    if (data.payload.creatorId !== localStorage.getItem("userId")) {
      ssp({
        inPreQuiz: "true",
        creatorId: data.payload.creatorId,
      });
    }
    form.setValue("players", data.payload.users);
  };

  const onRemovePreQuiz = () => {
    const params = new URLSearchParams(sp);
    params.delete("inPreQuiz");
    params.delete("creatorId");
    ssp(params.toString());
    toast.error("Quiz Cancelled by creator");
  };

  const handleEmitSocketMessages = ({
    emitSocketMessage,
    type,
    externalPayloadParams,
  }: {
    emitSocketMessage: ({ type, payload }: ISendSocketMessageProps) => void;
    type: ISendSocketMessageProps["type"];
    externalPayloadParams?: any;
  }) => {
   

    const payload = createPayload({
      type,
      username,
      userId: localStorage.getItem("userId") ?? "",
      sp,
    });
    
    emitSocketMessage({
      type,
      payload: {
        ...payload,
        ...externalPayloadParams,
      },
    });
  };

  return {
    onIncomingInvite,
    onInviteAccepted,
    onInQuiz,
    onRemovePreQuiz,
    handleEmitSocketMessages,
  };
};

const createPayload = ({
  type,
  username,
  userId,
  sp,
}: {
  type: ISendSocketMessageProps["type"];
  username: string;
  userId: string;
  sp: URLSearchParams;
}) => {
  let payload = {};
  switch (type) {
    case "REMOVE_PRE_QUIZ": {
      payload = {
        userId,
      };
      break;
    }

    case "INVITE_ACCEPTED": {
      payload = {
        invitedByUserId: sp.get("invitedById"),
        username: sp.get("invitedBy"),
        quizName: sp.get("quizName"),
        invitedUserId: userId,
        invitedUsername: username,
      };
      break;
    }

    case "INVITE_DECLINED": {
      payload = {
        invitedByUserId: sp.get("invitedById"),
        username: sp.get("invitedBy"),
        quizName: sp.get("quizName"),
        invitedUserId: userId,
        invitedUsername: username,
      };
      break;
    }

    case "QUIZ_STARTED": {
      payload = {
        creatorId: userId,
      };
      break;
    }

    case "INVITE_SENT": {
      payload = {
        invitedByUserId: userId,
        username,
      };
      break;
    }
    case "PRE_QUIZ": {
      payload = {
        userId,
        username,
      };
      break;
    }
    case "QUESTION": {
      payload = {
        quizCreatorId: userId,
      };
    }
  }

  return payload;
};
