/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Collapse,
  Dialog,
  Grid2,
  IconButton,
  Popover,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import {
  ArrowDropDown,
  ArrowDropUp,
  Close,
  DeleteForever,
} from "@mui/icons-material";
import { useEffect, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { authAxios } from "../../../http";
import { useSocketProvider } from "../../../Providers";
export const AddQuiz = ({
  open,
  handleClose,
  onSubmit,
  onAddQuestions,
}: IAddQuizProps) => {
  const form = useFormContext();
  const [openedQuestionIndexes, setOpenedQuestionIndexes] = useState(
    [] as number[]
  );
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
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
      <Stack direction="row" width="100%" justifyContent="space-between">
        <Typography variant="h3">Lets make a quiz</Typography>
        <IconButton onClick={handleClose} sx={{ alignSelf: "flex-end" }}>
          <Close color="secondary" />
        </IconButton>
      </Stack>
      <Stack>
        <TextField
          {...form.register("name")}
          placeholder="Enter a unique quiz name"
        />
      </Stack>

      <Box display="flex" gap={2} alignItems="center">
        <Button onClick={onAddQuestions} variant="outlined">
          Add some Questions!!
        </Button>
        <Typography>/</Typography>
        <Button
          variant="outlined"
          sx={{
            backgroundColor: "success.main",
            color: "background.default",
            border: "none",
          }}
        >
          Add from prev quizzes
        </Button>
      </Box>
      <Stack width="100%" gap={2}>
        {form.watch("questions").map((q: any, i: number) => (
          <Stack width="100%" borderBottom="1px solid #EDECF9" key={i}>
            <Box width="100%" display="flex" justifyContent="space-between">
              <Typography variant="body1">{q.question}</Typography>
              <Box display="flex" gap={2} alignItems="center">
                <IconButton
                  onClick={() =>
                    setOpenedQuestionIndexes((p) => {
                      if (p.includes(i)) {
                        return p.filter((pi) => pi !== i);
                      }
                      return [...p, i];
                    })
                  }
                >
                  {!openedQuestionIndexes.includes(i) ? (
                    <ArrowDropDown color="primary" />
                  ) : (
                    <ArrowDropUp color="primary" />
                  )}
                </IconButton>
                <IconButton
                  onClick={() =>
                    form.setValue(
                      "questions",
                      form
                        .getValues("questions")
                        ?.filter((_: any, qi: number) => qi !== i)
                    )
                  }
                >
                  <DeleteForever color="error" />
                </IconButton>
              </Box>
            </Box>
            <Collapse in={openedQuestionIndexes.includes(i)}>
              <Grid2 container spacing={2} sx={{ justifySelf: "center" }}>
                {q.answers.map((a: any, ai: number) => (
                  <Grid2
                    size={{ lg: 6 }}
                    key={ai}
                    sx={{ display: "flex", alignItems: "center" }}
                  >
                    <Typography>{a.label}</Typography>
                    <Checkbox color="success" checked={!!a.isCorrect} />
                  </Grid2>
                ))}
              </Grid2>
            </Collapse>
          </Stack>
        ))}
      </Stack>
      <UserSearch />
      <Button
        sx={{ width: "200px" }}
        variant="contained"
        color="info"
        onClick={onSubmit}
      >
        Make it
      </Button>
    </Dialog>
  );
};

const UserSearch = () => {
  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearchValue, setDebouncedSearchValue] = useState("");
  const anchorEl = useRef<any | null>(null);
  const { handleSendSocketMessage } = useSocketProvider();

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearchValue(searchValue);
    }, 600);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [searchValue]);

  const userSearchQuery = useQuery({
    queryKey: ["userSearch", debouncedSearchValue],
    queryFn: () =>
      authAxios.get("/api/user/search", {
        params: { search: debouncedSearchValue },
      }),
    enabled: !!debouncedSearchValue,
  });
  return (
    <Stack>
      <TextField
        onClick={(e) => {
          anchorEl.current = e.currentTarget;
        }}
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        placeholder="Search for a user to invite them"
      />
      <Popover
        open={!!debouncedSearchValue}
        anchorEl={anchorEl.current}
        onClose={() => setDebouncedSearchValue("")}
        anchorPosition={{ top: 100, left: 0 }}
        slotProps={{
          paper: {
            sx: {
              width: "350px",
              mt: 6,
              p: 2,
            },
          },
        }}
      >
        <Typography pb={2} variant="h6">
          Users for your search:
        </Typography>
        {userSearchQuery.isLoading ? (
          <CircularProgress />
        ) : !userSearchQuery.data?.data?.users.length ? (
          <Typography>No Users found for {debouncedSearchValue}</Typography>
        ) : (
          <Stack direction="row" gap={1} flexWrap={"wrap"}>
            {userSearchQuery.data?.data?.users.map((u: any) => (
              <Chip
                label={u.username}
                key={u.userId}
                color="success"
                sx={{ color: "secondary.main" }}
                onClick={() => {
                  handleSendSocketMessage({
                    type: "invite-sent",
                    payload: {
                      invitedUserId: u.userId,
                      invitedByUserId: localStorage.getItem("userId"),
                    },
                  });
                }}
              />
            ))}
          </Stack>
        )}
      </Popover>
    </Stack>
  );
};

interface IAddQuizProps {
  open: boolean;
  handleClose: () => void;
  onSubmit: () => void;
  onAddQuestions: () => void;
}
