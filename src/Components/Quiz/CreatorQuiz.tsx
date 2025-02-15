import { Button, Stack, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { authAxios } from "../../http";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ICurrentQues, useSocketProvider } from "../../Providers";
import { toast } from "react-toastify";

export const QuizCreator = () => {
  const { quizId, quizName } = useParams();
  const [seconds, setSeconds] = useState(0);
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState<ICurrentQues | null>(
    null
  );
  const { handleSendSocketMessage } = useSocketProvider();

  const getQuizDetailsQuery = useQuery({
    queryKey: ["getQuizDetails", quizId],
    queryFn: async () => {
      const { data } = await authAxios.get(`/api/quiz/${quizId}`);
      console.log({ data });

      const quizData = {
        quizCreatorName: data?.quiz.createdBy,
        options: data?.quiz?.questions[0]?.answers?.map((item: any) => ({
          option: item.answer,
          optionId: item.answerId,
        })),
        question: data?.quiz?.questions[0].question,
        questionId: data?.quiz.questions[0].questionId,
        quizId: data?.quiz.quizId,
      };
      setCurrentQuestion({
        quizCreatorId: localStorage.getItem("userId") ?? "",
        ...quizData,
      });
      handleSendSocketMessage({
        type: "QUESTION",
        externalPayloadParams: {
          ...quizData,
        },
      });
      return data;
    },
    staleTime: Infinity,
  });
  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((seconds) => seconds + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const isLastQuestion = useMemo(() => {
    return (
      currentQuestion?.questionId ===
      getQuizDetailsQuery.data?.quiz?.questions?.[
        getQuizDetailsQuery.data.quiz.questions.length -1
      ]?.questionId
    );
  }, [currentQuestion, getQuizDetailsQuery.data]);
  const onNextQuesClick = useCallback(() => {
    if (!isLastQuestion) {
      const idx = getQuizDetailsQuery.data?.quiz?.questions.findIndex(
        (item: any) => item.questionId === currentQuestion?.questionId
      );
      const nextQues = getQuizDetailsQuery.data?.quiz?.questions[idx + 1];
      const temp = {
        quizId: getQuizDetailsQuery.data?.quiz.createdBy.quizId,
        quizCreatorName: getQuizDetailsQuery.data?.quiz.createdBy,
        options: nextQues?.answers?.map((item: any) => ({
          option: item.answer,
          optionId: item.answerId,
        })),
        question: nextQues?.question,
        questionId: nextQues?.questionId,
      };
      setCurrentQuestion({
        quizCreatorId: localStorage.getItem("userId") ?? "",
        ...temp,
      });
      handleSendSocketMessage({
        type: "QUESTION",
        externalPayloadParams: {
          ...temp,
        },
      });
    } else {
      navigate("/dashboard");
      toast.success("Quiz Finished");
    }
    setSeconds(0);
  }, [
    isLastQuestion,
    handleSendSocketMessage,
    currentQuestion,
    getQuizDetailsQuery.data,
  ]);

  return (
    <Stack direction="column" alignItems="center" textAlign="center" gap={2}>
      <Typography variant="h2" fontWeight={700}>
        You are the creator of {quizName}
      </Typography>
      <Typography variant="h3">
        Your job is to navigate users through the questions
      </Typography>
      <Stack alignItems="center" direction="row" gap={2} pt={3}>
        <Typography variant="h2" fontWeight={800}>
          {seconds}{" "}
        </Typography>
        <Typography variant="body1">seconds </Typography>
      </Stack>
      <Button onClick={onNextQuesClick} variant="contained">
        {isLastQuestion ? "Finish" : "Next Question"}
      </Button>
      <Typography variant="body1">Do not refresh</Typography>
    </Stack>
  );
};
