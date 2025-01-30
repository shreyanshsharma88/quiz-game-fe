import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { authAxios } from "../../../http";

export const useDashboard = () => {
  const navigate = useNavigate();


  const getUserQuery = useQuery({
    queryKey: ["user"],
    queryFn: () => authAxios.get("/api/user"),
  });

  

  const handleLogout = () => {
    localStorage.removeItem("userId");
    navigate("/");
  };

  return { getUserQuery, handleLogout };
};
