import { request } from "@/lib/axios";
import { Adventure, NewTripPayload } from "@/types";
import { useAuth } from "@clerk/nextjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useAdventure = ({
  userId,
  adventureId,
}: { userId?: string | undefined; adventureId?: string } = {}) => {
  const context = useQueryClient();
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
    refetchOnWindowFocus: false,
  });

  const update = useMutation({
    mutationFn: async (payload: NewTripPayload) => {
      return request.put(`/api/adventure/${adventureId}`, payload, {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
        },
      });
    },
  });

  const removeImage = useMutation({
    mutationFn: async (data: {
      adv_id: string;
      image_id: string;
      url: string;
    }) => {
      return request.delete(
        `/api/adventure/${data.adv_id}/image/${data.image_id}?url=${data.url}`,
        {
          headers: {
            Authorization: `Bearer ${await getToken()}`,
          },
        }
      );
    },
    onSuccess: () => {
      toast.success("Image removed");
      context.invalidateQueries({ queryKey: ["adventure", adventureId] });
    },
  });

  const removeBuild = useMutation({
    mutationFn: async (data: { adv_id: string; build_id: string }) => {
      return request.delete(
        `/api/adventure/${data.adv_id}/build/${data.build_id}`,
        {
          headers: {
            Authorization: `Bearer ${await getToken()}`,
          },
        }
      );
    },
    onSuccess: () => {
      toast.success("Build removed");
      context.invalidateQueries({ queryKey: ["adventure", adventureId] });
    },
  });

  const removeDay = useMutation({
    mutationFn: async (data: { adv_id: string; day_id: string }) => {
      return request.delete(
        `/api/adventure/${data.adv_id}/day/${data.day_id}`,
        {
          headers: {
            Authorization: `Bearer ${await getToken()}`,
          },
        }
      );
    },
    onSuccess: () => {
      toast.success("Day removed");
      context.invalidateQueries({ queryKey: ["adventure", adventureId] });
    },
  });

  return {
    create,
    adventures,
    adventureById,
    update,
    removeImage,
    removeBuild,
    removeDay,
  };
};
