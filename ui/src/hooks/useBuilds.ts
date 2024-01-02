import { request } from "@/lib/axios";
import { Build } from "@/types";
import { useAuth } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";

export const useBuilds = (id: string | undefined) => {
  const { getToken } = useAuth();
  const query = useQuery({
    queryKey: ["user_builds", id],
    queryFn: async (): Promise<Build[]> => {
      return request
        .get(`/api/builds/user/${id}`, {
          headers: {
            Authorization: `Bearer ${await getToken()}`,
          },
        })
        .then((res) => res.data);
    },
    enabled: !!id,
  });

  return {
    builds: query,
  };
};
