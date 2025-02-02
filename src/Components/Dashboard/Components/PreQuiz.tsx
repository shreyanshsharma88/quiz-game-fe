import { Chip, Dialog, Stack, Typography } from "@mui/material";
import { useFormContext } from "react-hook-form";
import { useSearchParams } from "react-router-dom";
import LoadingAnimation from "../../../../public/Lottie/loading-animation.json";
import Lottie from "lottie-react";

export const PreQuiz = ({ open }: IPreQuizProps) => {
  const [sp] = useSearchParams();
  const form = useFormContext();
  return (
    <Dialog
      open={open}
      slotProps={{
        paper: {
          sx: {
            padding: "20px",
            borderRadius: "20px",
            alignItems: "center",
            gap: "20px",
          },
        },
      }}
    >
      <Typography variant="h4">In PreQuiz Lobby</Typography>
      <Typography variant="h6">Waiting for other players to join</Typography>
      <Typography>Joined Users: </Typography>
      <Stack direction="row" gap={2} flexWrap="wrap">
        {form
          .getValues("players")
          .map((player: { userId: string; username: string }) => {
            return (
              <Chip
                label={player.username}
                key={player.userId}
                color="warning"
              />
            );
          })}
      </Stack>
      <Lottie animationData={LoadingAnimation} />
      <Typography variant="body2">
        This is created by {sp.get("creatorId") ?? "IDK someone dumb"}
      </Typography>
    </Dialog>
  );
};

interface IPreQuizProps {
  open: boolean;
}
