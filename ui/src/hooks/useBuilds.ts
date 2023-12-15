import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export const useBuilds = (id: string | undefined) => {
  const query = useQuery({
    queryKey: ["build", id],
    queryFn: () => {
      return axios
        .get(`http://localhost:8000/api/builds/user/${id}`, {
          withCredentials: true,
        })
        .then((res) => res.data);
    },
    enabled: !!id,
  });

  return {
    builds: query,
  };
};
