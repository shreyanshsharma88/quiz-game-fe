import { useQuery } from "@tanstack/react-query";
import { authAxios } from "../http";

export const useGetUser = () => {
  const getUserQuery = useQuery({
    queryKey: ["user"],
    queryFn: () => authAxios.get("/api/user"),
  });
  return { getUserQuery };
};
