import { request } from "@/lib/axios";
import { useAuth } from "@clerk/nextjs";
import { useMutation } from "@tanstack/react-query";

export const useTrips = () => {
  const { getToken } = useAuth();

  const deleteTrip = useMutation({
    mutationFn: async ({ build_id, id }: { build_id: string; id: string }) => {
      return request.delete(`/api/build/${build_id}/${id}/delete`, {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
        },
      });
    },
  });

  return { deleteTrip };
};
