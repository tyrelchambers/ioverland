import { request } from "@/lib/axios";
import { Explore } from "@/types";
import { useQuery } from "@tanstack/react-query";

export const useExplore = () => {
  const explore = useQuery({
    queryKey: ["explore"],
    queryFn: (): Promise<Explore> => {
      return request
        .get(`/api/explore/`, {
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
