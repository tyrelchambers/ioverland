import { request } from "@/lib/axios";
import { Build } from "@/types";
import { useQuery } from "@tanstack/react-query";

export const useBuilds = (id: string | undefined) => {
  const query = useQuery({
    queryKey: ["user_builds", id],
    queryFn: (): Promise<Build[]> => {
      return request
        .get(`/api/builds/user/${id}`, {
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
