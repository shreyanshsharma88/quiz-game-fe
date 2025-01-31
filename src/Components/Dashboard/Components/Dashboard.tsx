/* eslint-disable @typescript-eslint/no-unused-vars */
import { IconButton, Stack, Tooltip, Typography } from "@mui/material";

import { Add, Logout } from "@mui/icons-material";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useGetUser } from "../../../Hooks";
import { useSocketProvider } from "../../../Providers";

export const Dashboard = () => {
  const { getUserQuery } = useGetUser();
  const navigate = useNavigate();
  const [_, ssp] = useSearchParams();
  const { handleSendSocketMessage} = useSocketProvider()

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
          onClick={() => {ssp("addQuizOpen=true")
            handleSendSocketMessage({
              type: "PRE_QUIZ",
              payload: {
                userId: localStorage.getItem("userId"),
                username : getUserQuery.data?.data.username 
              },
            })
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
