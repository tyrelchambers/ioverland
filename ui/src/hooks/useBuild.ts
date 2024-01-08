import { request } from "@/lib/axios";
import { Build, EditBuildResponse } from "@/types";
import { useAuth } from "@clerk/nextjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { useRouter } from "next/router";
import { toast } from "sonner";

export const useBuild = (id?: string) => {
  const router = useRouter();
  const { getToken } = useAuth();
  const context = useQueryClient();
  const getById = useQuery({
    queryKey: ["build", id],
    queryFn: (): Promise<Build> => {
      return request
        .get(`/api/build/${id}`, {
          withCredentials: true,
        })
        .then((res) => res.data);
    },
    enabled: !!id,
  });

  const createBuild = useMutation({
    mutationFn: async (data: Build) => {
      return request.post("/api/build/", data, {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
        },
      });
    },
    onSuccess: () => {
      toast.success("Build created");
      router.push("/dashboard");
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        return toast.error("Error", {
          description: error.response?.data.message || error.response?.data,
        });
      }
      toast.error("Error", {
        description: "Something went wrong. Please try again.",
      });
    },
  });

  const updateBuild = useMutation({
    mutationFn: async (data: Build) => {
      return request.put(`/api/build/${id}`, data, {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
        },
      });
    },
    onSuccess: () => {
      toast.success("Build updated");
      context.invalidateQueries({ queryKey: ["build", id] });
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        toast.error("Error", {
          description: error.response?.data.message || error.response?.data,
        });
      }
    },
  });

  const removeImage = useMutation({
    mutationFn: async (data: {
      build_id: string;
      image_id: string;
      url: string;
    }) => {
      return request.delete(
        `/api/build/${data.build_id}/image/${data.image_id}?url=${data.url}`,
        {
          headers: {
            Authorization: `Bearer ${await getToken()}`,
          },
        }
      );
    },
    onSuccess: () => {
      toast.success("Image removed");
      context.invalidateQueries({ queryKey: ["build_settings", id] });
    },
  });

  const incrementView = useMutation({
    mutationFn: async (data: { build_id: string }) => {
      return request.post(
        `/api/build/${data.build_id}/view`,
        {},
        {
          headers: {
            Authorization: `Bearer ${await getToken()}`,
          },
        }
      );
    },

    onSuccess: () => {
      context.invalidateQueries({ queryKey: ["build", id] });
    },
  });

  const likeBuild = useMutation({
    mutationFn: async (data: { build_id: string }) => {
      return request.post(
        `/api/build/${data.build_id}/like`,
        {},
        {
          headers: {
            Authorization: `Bearer ${await getToken()}`,
          },
        }
      );
    },
    onSuccess: () => {
      context.invalidateQueries({ queryKey: ["build", id] });
    },
  });

  const dislikeBuild = useMutation({
    mutationFn: async (data: { build_id: string }) => {
      return request.post(
        `/api/build/${data.build_id}/dislike`,
        {},
        {
          headers: {
            Authorization: `Bearer ${await getToken()}`,
          },
        }
      );
    },
    onSuccess: () => {
      context.invalidateQueries({ queryKey: ["build", id] });
    },
  });

  const deleteBuild = useMutation({
    mutationFn: async (data: { build_id: string }) => {
      return request.delete(`/api/build/${data.build_id}/delete`, {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
        },
      });
    },
    onSuccess: () => {
      toast.success("Build deleted");
      context.invalidateQueries({ queryKey: ["user_builds", id] });
    },
    onError: () => {
      toast.error("Error", {
        description: "Something went wrong",
      });
    },
  });

  const editSettings = useQuery({
    queryKey: ["build_settings", id],
    queryFn: async (): Promise<EditBuildResponse> => {
      return request
        .get(`/api/build/${id}/edit`, {
          headers: {
            Authorization: `Bearer ${await getToken()}`,
          },
        })
        .then((res) => res.data);
    },
    enabled: !!id,
  });

  return {
    createBuild,
    getById,
    update: updateBuild,
    removeImage,
    incrementView,
    likeBuild,
    dislikeBuild,
    deleteBuild,
    editSettings,
  };
};
