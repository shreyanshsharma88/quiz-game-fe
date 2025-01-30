import { IconButton, Stack, Tooltip, Typography } from "@mui/material";
import { useDashboard } from "../Hooks/useDashboard";

import { Add, Logout } from "@mui/icons-material";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AddQuiz } from "./AddQuiz";
import { AddQuizQuestions } from "./AddQuizQuestions";
import { useAddQuiz } from "../Hooks";
import { FormProvider } from "react-hook-form";

export const Dashboard = () => {
  const { getUserQuery } = useDashboard();
  const [sp, ssp] = useSearchParams();
  const navigate = useNavigate();
  const { form } = useAddQuiz();

  return (
    <Stack alignItems="center" height="90dvh" direction="column" gap={4} p={2}>
      <Stack
        alignItems="center"
        direction="row"
        p={2}
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

      <Stack height="80%" width="80%" overflow="auto" gap={2}>
        <Typography variant="h5">No Previous quizzes. New here?</Typography>
      </Stack>

      <Tooltip title="Create a new quiz">
        <IconButton
          onClick={() => ssp("addQuizOpen=true")}
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

      <FormProvider {...form}>
        <AddQuiz
          open={!!sp.get("addQuizOpen")}
          handleClose={() => {
            const params = new URLSearchParams(sp);
            params.delete("addQuizOpen");
            ssp(params.toString());
          }}
          onSubmit={() => {}}
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
      </FormProvider>
    </Stack>
  );
};
