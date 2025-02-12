import { Stack, Typography } from "@mui/material";
import { useParams } from "react-router-dom";

export const Quiz = () => {
  const { quizName } = useParams();

  return (
    <Stack direction="column" gap={2}>
      <Typography variant="h2">{quizName}</Typography>
      <Typography variant="caption">DO not Refresh</Typography>
    </Stack>
  );
};
