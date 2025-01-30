import { Close } from "@mui/icons-material";
import {
  Button,
  Checkbox,
  Dialog,
  Grid2,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useCallback, useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";
import { IQuestions } from "../Hooks";

const initialQuestion = {
  answers: [
    { label: "", isCorrect: false },
    { label: "", isCorrect: false },
    { label: "", isCorrect: false },
    { label: "", isCorrect: false },
  ],
  question: "",
};
export const AddQuizQuestions = ({
  open,
  handleClose,
}: IAddQuizQuestionsProps) => {
  const [question, setQuestion] = useState<IQuestions>(initialQuestion);
  const form = useFormContext();

  const handleSetQuestion = useCallback(
    ({
      i,
      value,
      isChecked,
    }: {
      i: number | "question";
      value: string;
      isChecked?: boolean;
    }) => {
      if (i === "question") {
        setQuestion((p) => {
          return { ...p, question: value };
        });
        return;
      }
      setQuestion((p) => {
        return {
          ...p,
          answers: p.answers.map((a, index) => {
            if (index === i) {
              return { label: value, isCorrect: isChecked || a.isCorrect };
            }
            return {
              ...a,
              isCorrect: false,
            };
          }),
        };
      });
    },
    [setQuestion]
  );

  const isValid = useMemo(() => {
    return (
      question.answers.every((a) => a.label !== "") &&
      question.question !== "" &&
      question.answers.some((a) => a.isCorrect)
    );
  }, [question]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      slotProps={{
        paper: {
          sx: {
            padding: "20px",
            borderRadius: "10px",
            alignItems: "center",
            gap: "20px",
          },
        },
      }}
    >
      <Stack direction="row" width="100%" justifyContent="space-between">
        <Typography variant="h3">Add a Question</Typography>
        <IconButton
          onClick={() => {
            handleClose();
            setQuestion(initialQuestion);
          }}
          sx={{ alignSelf: "flex-end" }}
        >
          <Close color="secondary" />
        </IconButton>
      </Stack>
      <Stack
        gap={1}
        sx={{
          ".MuiOutlinedInput-root": {
            backgroundColor: "#27293d !important",
            color: "secondary.main",
          },
        }}
      >
        <TextField
          value={question?.question ?? ""}
          onChange={(e) =>
            handleSetQuestion({ i: "question", value: e.target.value })
          }
          placeholder="Enter a question"
        />
        <Grid2 container spacing={2}>
          {question.answers.map((_, i) => (
            <Grid2
              key={i}
              size={{
                lg: 6,
              }}
              sx={{ display: "flex", alignItems: "center" }}
            >
              <TextField
                placeholder={`Option ${i + 1}`}
                value={question?.answers[i].label ?? ""}
                onChange={(e) =>
                  handleSetQuestion({ i: i, value: e.target.value })
                }
              />
              <Checkbox
                checked={question?.answers[i].isCorrect}
                color="success"
                onChange={(e) =>
                  handleSetQuestion({
                    i,
                    value: question.answers[i].label ?? "",
                    isChecked: e.target.checked,
                  })
                }
              />
            </Grid2>
          ))}
        </Grid2>
      </Stack>
      <Button
        sx={{ width: "200px" }}
        variant="contained"
        color="info"
        onClick={() => {
          form.setValue("questions", [...form.getValues().questions, question]);
          setQuestion(initialQuestion);
          handleClose();
        }}
        disabled={!isValid}
      >
        Add Question
      </Button>
    </Dialog>
  );
};

interface IAddQuizQuestionsProps {
  open: boolean;
  handleClose: () => void;
}
