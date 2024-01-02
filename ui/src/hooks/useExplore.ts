import { request } from "@/lib/axios";
import { Explore } from "@/types";
import { useAuth } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";

export const useExplore = () => {
  const { getToken } = useAuth();
  const explore = useQuery({
    queryKey: ["explore"],
    queryFn: async (): Promise<Explore> => {
      return request
        .get(`/api/explore/`, {
          headers: {
            Authorization: `Bearer ${await getToken()}`,
          },
        })
        .then((res) => res.data);
    },
    structuralSharing: false,
  });

  return {
    explore,
  };
};
