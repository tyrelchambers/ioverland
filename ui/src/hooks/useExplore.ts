import { Explore } from "@/types";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export const useExplore = () => {
  const explore = useQuery({
    queryKey: ["explore"],
    queryFn: (): Promise<Explore> => {
      return axios
        .get(`http://localhost:8000/api/explore/`, {
          withCredentials: true,
        })
        .then((res) => res.data);
    },
    structuralSharing: false,
  });

  return {
    explore,
  };
};
