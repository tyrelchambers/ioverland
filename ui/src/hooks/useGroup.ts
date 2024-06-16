import { request } from "@/lib/axios";
import {
  EditGroupSchema,
  Group,
  GroupJoinRequest,
  NewGroupSchema,
} from "@/types";
import { useAuth } from "@clerk/nextjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosResponse } from "axios";
import { useDomainUser } from "./useDomainUser";

export const useGroup = ({ id }: { id?: string } = {}) => {
  const { getToken } = useAuth();
  const { user } = useDomainUser();
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
    queryFn: async (): Promise<{
      group: Group;
      is_member: boolean;
      is_pending_member: boolean;
    }> => {
      return request
        .get(`/api/group/${id}`, {
          headers: {
            ["User-Id"]: user.data?.uuid,
          },
        })
        .then((res) => res.data);
    },
    enabled: !!id && !!user.isSuccess,
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

  const leave = useMutation({
    mutationFn: async (groupId: string) => {
      return request
        .post(
          `/api/group/${groupId}/leave`,
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

  const requests = useQuery({
    queryKey: ["group_requests", id],
    queryFn: async (): Promise<GroupJoinRequest[]> => {
      return request
        .get(`/api/group/${id}/requests`, {
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
    update,
    join,
    leave,
    requests,
  };
};
