import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { authAxios } from "../../http";

export const useLoginSignup = () => {
  const [userAction, setUserAction] = useState<"login" | "signup">("login");

  const navigate = useNavigate();
  const form = useForm({
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const submitMutation = useMutation({
    mutationFn: (data: {
      username: string;
      password: string;
      route: "/user" | "/user/login";
    }) =>
      authAxios.post(data.route, {
        username: data.username,
        password: data.password,
      }),
      onSuccess: (data) => {
        localStorage.setItem("token", data.data.token);
        localStorage.setItem("userId", data.data.userId);
        navigate("/dashboard");
        toast.success("Logged in successfully");
      }
  });

  const handleSubmit = form.handleSubmit((data) => {
    submitMutation.mutate({
      username: data.username,
      password: data.password,
      route: userAction === "login" ? "/user/login" : "/user",
    });
  });

  return {
    userAction,
    setUserAction,
    form,
    handleSubmit,
  };
};
