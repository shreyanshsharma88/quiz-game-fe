import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { authAxios } from "../../../http";
import { useNavigate } from "react-router-dom";

export const useDashboard = () => {
  const userId = localStorage.getItem("userId");
  const navigate = useNavigate();

  const [socket, setSocket] = useState<WebSocket | null>(null);

  const getUserQuery = useQuery({
    queryKey: ["user", userId],
    queryFn: () => authAxios.get("/api/user"),
  });

  useEffect(() => {
    if (userId) {
      const ws = new WebSocket(`ws://localhost:8080/ws/${userId}`);
      ws.onopen = () => {
        console.log("WebSocket connection established.");
      };
      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
      };
      setSocket(ws);
    }
  }, [userId]);

  const handleLogout = () => {
    localStorage.removeItem("userId");
    socket?.close();
    navigate("/");
  };

  return { getUserQuery, handleLogout };
};
