import { Chip, Grid2, Stack, Typography } from "@mui/material";
import { useParams } from "react-router-dom";
import { useSocketProvider } from "../../Providers";

export const Quiz = () => {
  const { quizName } = useParams();
  const { currentQuestion } = useSocketProvider();

  return (
    <Stack direction="column" gap={2} p={2}>
      <Typography variant="h2" fontWeight={700}>
        {quizName}
      </Typography>

      {!currentQuestion ? (
        <Typography>Waiting for creator</Typography>
      ) : (
        <Stack direction="column" gap={2}>
          <Typography variant="h2" color="error" fontWeight={700}>
            Question:{" "}
          </Typography>
          <Typography color="error" variant="h4">
            {currentQuestion.question}?
          </Typography>
          <Grid2 container spacing={2}>
            {currentQuestion.options.map((option) => (
              <Grid2 size={{ sm: 6 }} key={option.optionId}>
                <Chip
                  color="warning"
                  sx={{
                    width: "100%",
                  }}
                  label={option.option}
                />
              </Grid2>
            ))}
          </Grid2>
        </Stack>
      )}
      <Typography textAlign='center' variant="caption">DO NOT REFRESH</Typography>
    </Stack>
  );
};
