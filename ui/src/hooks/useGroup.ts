import { request } from "@/lib/axios";
import { NewGroupSchema } from "@/types";
import { useAuth } from "@clerk/nextjs";
import { useMutation } from "@tanstack/react-query";

export const useGroup = () => {
  const { getToken } = useAuth();
  const create = useMutation({
    mutationFn: async (data: NewGroupSchema) => {
      return request.post("/api/group/new", data, {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
        },
      });
    },
  });

  return {
    create,
  };
};
