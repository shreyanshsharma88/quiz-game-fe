import {
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { authAxios } from "../../../http";
import { IQuestions } from "../Hooks";

export const AddPrevQuestions = ({ onClose, open }: IAddPrevQuestionsProps) => {
  const getMyQuestionsQuery = useQuery({
    queryKey: ["questions"],
    queryFn: () => authAxios.get("/api/question"),
  });
  const [selectedQues, setSelectedQues] = useState<IQuestion[]>([]);
  const form = useFormContext();
  useEffect(() => {
    const data = form.getValues("questions")?.map((q: IQuestions) => {
      if (q?.questionId) {
        return {
          questionId: q.questionId,
          question: q.question,
          answers: q.answers?.map((a) => {
            return {
              answerId: a.answerId,
              answer: a.label,
              isCorrect: a.isCorrect,
            };
          }),
        };
      }
    });
    setSelectedQues(data ?? []);
  }, []);
  console.log({selectedQues});
  

  const handleSubmit = () => {
    const data = selectedQues.map((q) => {
      return {
        question: q.question,
        questionId: q.questionId,
        answers: q.answers.map((a) => {
          return {
            label: a.answer,
            isCorrect: a.isCorrect,
          };
        }),
      };
    });

    const newQuestions = form
      .getValues("questions")
      ?.filter((q: IQuestions) => !q?.questionId);
    form.setValue("questions", [...newQuestions, ...data]);
    onClose();
  };
  return (
    <Dialog
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            borderRadius: "10px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "20px",
            p: 2,
          },
        },
      }}
    >
      <Typography variant="h5">
        Here are some previous questions that you asked, you can pick some of
        these too
      </Typography>
      {getMyQuestionsQuery.isLoading && <CircularProgress />}
      {getMyQuestionsQuery.data?.data?.questions?.map((q: IQuestion) => {
        const selected = selectedQues.find(
          (ques) => q.questionId === ques.questionId
        );
        return (
          <Stack
            key={q.questionId}
            direction="column"
            gap={1}
            borderBottom="1px solid white"
            py={1}
            width="100%"
          >
            <Stack alignItems="center" direction="row" gap={1}>
              <Checkbox
                checked={!!selected}
                color="success"
                onChange={() => {
                  if (selected) {
                    setSelectedQues(
                      selectedQues.filter(
                        (ques) => ques.questionId !== q.questionId
                      )
                    );
                  } else {
                    setSelectedQues([...selectedQues, q]);
                  }
                }}
              />
              <Typography
                sx={{
                  width: "200px",
                  textOverflow: "ellipsis",
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                }}
                variant="h6"
                fontWeight={700}
              >
                {q.question}
              </Typography>
            </Stack>
            <Stack direction="row" gap={2} flexWrap="wrap">
              {q.answers.map((a) => (
                <Tooltip title={a.answer} key={a.answerId}>
                  <Chip
                    color={a.isCorrect ? "success" : "error"}
                    label={a.answer}
                    sx={{
                      maxWidth: "150px",
                      textOverflow: "ellipsis",
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                    }}
                  />
                </Tooltip>
              ))}
            </Stack>
          </Stack>
        );
      })}
      <Button onClick={handleSubmit} variant="contained">
        Add selected
      </Button>
    </Dialog>
  );
};

interface IAddPrevQuestionsProps {
  open: boolean;
  onClose: () => void;
}

interface IQuestion {
  questionId: string;
  question: string;
  answers: { answerId: string; answer: string; isCorrect: boolean }[];
}
