import { request } from "@/lib/axios";
import { GroupJoinRequest } from "@/types";
import { useAuth } from "@clerk/nextjs";
import { useMutation, useQuery } from "@tanstack/react-query";

export const useRequests = ({ group_id }: { group_id: string }) => {
  const { getToken } = useAuth();
  const requests = useQuery({
    queryKey: ["group_requests", group_id],
    queryFn: async (): Promise<GroupJoinRequest[]> => {
      return request
        .get(`/api/group/${group_id}/requests`, {
          headers: {
            Authorization: `Bearer ${await getToken()}`,
          },
        })
        .then((res) => res.data);
    },
    enabled: !!group_id,
  });

  const decision = useMutation({
    mutationFn: async (data: {
      group_id: string;
      user_id: string;
      decision: string;
    }) => {
      return request
        .post(
          `/api/group/${data.group_id}/requests/${data.user_id}/${data.decision}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${await getToken()}`,
            },
          }
        )
        .then((res) => res.data);
    },
  });

  return {
    requests,
    decision,
  };
};
