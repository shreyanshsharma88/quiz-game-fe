import { useNavigate } from "react-router-dom";

export const useDashboard = () => {
  const navigate = useNavigate();

  
  const handleLogout = () => {
    localStorage.removeItem("userId");
    navigate("/");
  };

  return {  handleLogout };
};
