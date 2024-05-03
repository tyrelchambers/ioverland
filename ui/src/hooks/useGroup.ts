import { request } from "@/lib/axios";
import { Group, NewGroupSchema } from "@/types";
import { useAuth } from "@clerk/nextjs";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AxiosResponse } from "axios";

export const useGroup = ({ id }: { id?: string } = {}) => {
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
  const getById = useQuery({
    queryKey: ["group", id],
    queryFn: async (): Promise<Group> => {
      return request
        .get(`/api/group/${id}`, {
          headers: {
            Authorization: `Bearer ${await getToken()}`,
          },
        })
        .then((res) => res.data);
    },
    enabled: !!id,
  });

  return {
    create,
    group: getById,
  };
};
