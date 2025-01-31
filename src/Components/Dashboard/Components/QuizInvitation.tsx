import { ThumbDownAltOutlined, ThumbUpAltOutlined } from "@mui/icons-material";
import { Box, Dialog, Fab, Tooltip, Typography } from "@mui/material";
import Lottie from "lottie-react";
import { useSearchParams } from "react-router-dom";
import GameAnimation from "../../../../public/Lottie/video-game-animation.json";

export const QuizInvitation = ({
  handleAccept,
  handleClose,
  handleDecline,
  open,
}: IQuizInvitationProps) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [sp, _] = useSearchParams();
  const quizName = sp.get("quizName");
  const invitedBy = sp.get("invitedBy");
  const Options = [
    {
      label: "Yeah Lezzgoo",
      icon: <ThumbUpAltOutlined color="primary" />,
      handleClick: () => handleAccept(),
      color: "success",
    },
    {
      label: "Naah next time",
      icon: <ThumbDownAltOutlined color="primary" />,
      handleClick: () => handleDecline(),
      color: "error",
    },
  ];
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      slotProps={{
        paper: {
          sx: {
            backgroundColor: "warning.main",
            p: 2,
            borderRadius: "20px",
            display: "flex",
            flexDirection: "column",
            gap: 3,
            alignItems: "center",
          },
        },
      }}
    >
      <Typography variant="h4" fontWeight={700}>
        {invitedBy} has invited you in {quizName}
      </Typography>

      <Lottie animationData={GameAnimation} />

      <Typography variant="h5">Choose an option</Typography>
      <Box
        display="flex"
        flexDirection="row"
        justifyContent="space-between"
        gap={2}
      >
        {Options.map((option, index) => (
          <Tooltip title={option.label} key={index}>
            <Fab
              onClick={() => {
                option.handleClick();
                handleClose();
              }}
              color={option.color as "error" | "success"}
              size="large"
            >
              {option.icon}
            </Fab>
          </Tooltip>
        ))}
      </Box>
    </Dialog>
  );
};

interface IQuizInvitationProps {
  open: boolean;
  handleClose: () => void;
  handleAccept: () => void;
  handleDecline: () => void;
}
