/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Chip,
  CircularProgress,
  Collapse,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";

import { Add, ArrowDropDown, ArrowDropUp, Logout } from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useGetUser } from "../../../Hooks";
import { authAxios } from "../../../http";
import { useSocketProvider } from "../../../Providers";

// TODO: REFACTOR THIS SHIT, I WANNA SLEEP

export const Dashboard = () => {
  const { getUserQuery } = useGetUser();
  const navigate = useNavigate();
  const [sp, ssp] = useSearchParams();
  const { handleSendSocketMessage } = useSocketProvider();

  const getPreviousQuizzesQuery = useQuery({
    queryKey: ["quiz"],
    queryFn: () => authAxios.get("/api/quiz"),
  });

  const IsQuizOpen = useCallback(
    (id: string) => {
      const quizId = sp.get("quizId");
      return quizId === id;
    },
    [sp]
  );

  return (
    <Stack alignItems="center" height="90dvh" direction="column" gap={4} p={2}>
      <Stack
        alignItems="center"
        direction="row"
        py={2}
        justifyContent="space-between"
        width="100%"
      >
        <Typography variant="h4">{getUserQuery.data?.data.username}</Typography>
        <IconButton>
          <Logout
            sx={{ color: "white" }}
            onClick={() => {
              localStorage.clear();
              navigate("/");
            }}
          />
        </IconButton>
      </Stack>
      <Typography variant="h1" fontWeight={900}>
        Quiz Game
      </Typography>

      <Stack height="100%" width="100%" overflow="auto" gap={2} sx={{
        scrollbarWidth: "none",
        "&::-webkit-scrollbar": {
          display: "none",
        },
      }}>
        {!getPreviousQuizzesQuery.data?.data.quizzes.length ? (
          <Typography variant="h5">No Previous quizzes. New here?</Typography>
        ) : (
          getPreviousQuizzesQuery.data.data.quizzes.map((quiz: any) => {
            const open = IsQuizOpen(quiz.quizId);
            return (
              <Stack
                direction="column"
                width={"100%"}
                key={quiz.quizId}
                py={1}
                borderBottom="1px solid"
              >
                <Stack direction="row" justifyContent="space-between">
                  <Typography>{quiz.quizName}</Typography>
                  <IconButton
                    onClick={() => {
                      if (open) {
                        const searchParams = new URLSearchParams(sp.toString());
                        searchParams.delete("quizId");
                        ssp(searchParams.toString());
                        return;
                      }
                      ssp({
                        quizId: quiz.quizId,
                      });
                    }}
                  >
                    {!open ? (
                      <ArrowDropDown color="primary" />
                    ) : (
                      <ArrowDropUp color="primary" />
                    )}
                  </IconButton>
                </Stack>
                <Collapse in={open}>
                  <QuizDetails open={open} quizId={quiz.quizId} />
                </Collapse>
              </Stack>
            );
          })
        )}
      </Stack>

      <Tooltip title="Create a new quiz">
        <IconButton
          onClick={() => {
            ssp("addQuizOpen=true");
            handleSendSocketMessage({
              type: "PRE_QUIZ",
              payload: {
                userId: localStorage.getItem("userId"),
                username: getUserQuery.data?.data.username,
              },
            });
          }}
          sx={{
            borderRadius: "100%",
            p: 2,
            backgroundColor: "error.main",
            color: "secondary.main",
            alignSelf: "flex-end",
          }}
        >
          <Add />
        </IconButton>
      </Tooltip>
    </Stack>
  );
};

const QuizDetails = ({ open, quizId }: { open: boolean; quizId: string }) => {
  const getQuizDetailsQuery = useQuery({
    queryKey: ["quiz", quizId],
    queryFn: () => authAxios.get(`/api/quiz/${quizId}`),
    enabled: open,
  });
  const data = getQuizDetailsQuery.data?.data.quiz as Quiz;

  const refactoredData = useMemo(() => {
    if (!data) return null;
    let winner = { username: "", score: 0, userId: "" };
    data.participants?.reduce((acc, participant) => {
      if (participant.score > winner.score) {
        winner = participant;
      }
      return {
        ...acc,
        [participant.userId]: {
          username: participant.username,
          score: participant.score,
        },
      };
    }, {});

    return {
      ...data,
      winner: winner,
    };
  }, [data]);

  return (
    <Stack>
      {getQuizDetailsQuery.isLoading ? (
        <CircularProgress />
      ) : !refactoredData ? (
        <Typography>404</Typography>
      ) : (
        <Stack direction="column" gap={1}>
          <Typography variant="h5">{refactoredData.quizName} </Typography>
          <Typography variant="h6" color="warning">
            {localStorage.getItem("userId") === refactoredData.winner.userId
              ? "Yayy! You won this one"
              : `${refactoredData.winner.username} won this`}
          </Typography>
          <Typography variant="h6">
            Created by {refactoredData.createdBy} on {refactoredData.createdAt}
          </Typography>
          <Typography variant="h6">Participants: </Typography>
          <Stack direction="row" gap={2} flexWrap="wrap" width="100%">
            {refactoredData.participants?.map((participant) => {
              if (refactoredData.createdBy === participant.username)
                return null;
              return (
                <Chip
                  label={`${participant.username} : ${participant.score}`}
                  key={participant.userId}
                  color="primary"
                  variant="outlined"
                  sx={{
                    fontSize: "15px",
                    fontFamily: "poppins",
                  }}
                />
              );
            })}
          </Stack>
          <Typography variant="h6">Questions Asked</Typography>
          <Stack gap={1}>
            {refactoredData.questions.map((question) => (
              <Stack key={question.questionId}>
                <Typography variant="h6">{question.question}</Typography>
                <Stack gap={1} direction="row">
                  {question.answers.map((answer) => (
                    <Tooltip title={answer.answer}>
                      <Chip
                        key={answer.answerId}
                        label={answer.answer}
                        color={answer.isCorrect ? "success" : "error"}
                        sx={{
                          textOverflow: "ellipsis",
                          overflow: "hidden",
                          width: "200px",
                          whiteSpace: "nowrap",
                        }}
                      />
                    </Tooltip>
                  ))}
                </Stack>
              </Stack>
            ))}
          </Stack>
        </Stack>
      )}
    </Stack>
  );
};

interface Quiz {
  quizId: string;
  quizName: string;
  createdAt: string;
  createdBy: string;
  participants: Participant[];
  questions: Question[];
}

interface Participant {
  userId: string;
  username: string;
  score: number;
}

interface Question {
  questionId: string;
  question: string;
  answers: Answer[];
}

interface Answer {
  answerId: string;
  answer: string;
  isCorrect: boolean;
}
