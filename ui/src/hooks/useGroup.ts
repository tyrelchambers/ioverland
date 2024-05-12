import { request } from "@/lib/axios";
import { EditGroupSchema, Group, NewGroupSchema } from "@/types";
import { useAuth } from "@clerk/nextjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosResponse } from "axios";

export const useGroup = ({ id }: { id?: string } = {}) => {
  const { getToken } = useAuth();
  const qC = useQueryClient();
  const create = useMutation({
    mutationFn: async (data: NewGroupSchema): Promise<NewGroupSchema> => {
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

  const update = useMutation({
    mutationFn: async (data: EditGroupSchema) => {
      return request
        .post(`/api/group/${id}/edit`, data, {
          headers: {
            Authorization: `Bearer ${await getToken()}`,
          },
        })
        .then((res: AxiosResponse) => res.data);
    },
    onSuccess: () => {
      qC.invalidateQueries({ queryKey: ["group", id] });
    },
  });

  const join = useMutation({
    mutationFn: async (groupId: string) => {
      return request
        .post(
          `/api/group/${groupId}/join`,
          {},
          {
            headers: {
              Authorization: `Bearer ${await getToken()}`,
            },
          }
        )
        .then((res: AxiosResponse) => res.data);
    },
    onSuccess: () => {
      qC.invalidateQueries({ queryKey: ["group", id] });
    },
  });

  return {
    create,
    group: getById,
    update,
    join,
  };
};
