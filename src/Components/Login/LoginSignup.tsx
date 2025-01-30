import { Box, Button, Stack, TextField, Typography } from "@mui/material";
import { useLoginSignup } from "./useLoginSignup";

export const LoginSignup = () => {
  const { setUserAction, userAction, form, handleSubmit } = useLoginSignup();
  return (
    <Stack
      direction="column"
      gap={4}
      justifyContent="center"
      alignItems="center"
      mt={4}
    >
      <Typography variant="h1" fontWeight={900}>Quiz Game</Typography>
      <Stack
        width="420px"
        borderRadius={2}
        bgcolor="primary.main"
        p={2}
        gap={2}
        sx={{
          ".MuiTypography-root": {
            color: "background.paper",
          },
        }}
      >
        <Typography variant="h3">
          {userAction === "login" ? "Lets Log you in" : "Lets sign you up"}
        </Typography>

        <Stack
          component="form"
          onSubmit={handleSubmit}
          gap={2}
        >
          <TextField
            placeholder="Enter a unique username"
            {...form.register("username")}
          />
          <TextField
            placeholder="Enter Password"
            {...form.register("password")}
          />
          <Box
            onClick={() => {
              setUserAction(userAction === "login" ? "signup" : "login");
            }}
            sx={{
              cursor: "pointer",
            }}
            display="flex"
            gap={0.5}
          >
            <Typography>
              {userAction === "login"
                ? "Don't have an account?"
                : "Already have an account?"}
            </Typography>
            <Typography color="info.main !important" textTransform="capitalize">
              {userAction === "login" ? "Sign up" : "Login"}
            </Typography>
          </Box>
          <Button type="submit" variant="contained">
            LezzGo
          </Button>
        </Stack>
      </Stack>
    </Stack>
  );
};
