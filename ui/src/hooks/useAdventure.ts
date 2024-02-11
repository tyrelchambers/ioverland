import { request } from "@/lib/axios";
import { Adventure, NewTripPayload } from "@/types";
import { useAuth } from "@clerk/nextjs";
import { useMutation, useQuery } from "@tanstack/react-query";

export const useAdventure = ({
  userId,
  adventureId,
}: { userId?: string | undefined; adventureId?: string } = {}) => {
  const { getToken } = useAuth();
  const create = useMutation({
    mutationFn: async (payload: NewTripPayload) => {
      return request.post("/api/adventures/new", payload, {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
        },
      });
    },
  });

  const adventures = useQuery({
    queryKey: ["adventures", userId],
    queryFn: async (): Promise<Adventure[]> => {
      return request
        .get(`/api/adventures/${userId}`, {
          headers: {
            Authorization: `Bearer ${await getToken()}`,
          },
        })
        .then((res) => res.data);
    },
    enabled: !!userId,
  });

  const adventureById = useQuery({
    queryKey: ["adventure", adventureId],
    queryFn: async (): Promise<Adventure> => {
      return request
        .get(`/api/adventure/${adventureId}`, {
          headers: {
            Authorization: `Bearer ${await getToken()}`,
          },
        })
        .then((res) => res.data);
    },
    enabled: !!adventureId,
  });

  return { create, adventures, adventureById };
};
