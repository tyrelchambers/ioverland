import { Build } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosResponse, isAxiosError } from "axios";
import { toast } from "sonner";

export const useBuild = (id?: string) => {
  const context = useQueryClient();
  const getById = useQuery({
    queryKey: ["build", id],
    queryFn: (): Promise<Build> => {
      return axios
        .get(`http://localhost:8000/api/build/${id}`, {
          withCredentials: true,
        })
        .then((res) => res.data as Build);
    },
    enabled: !!id,
  });

  const createBuild = useMutation({
    mutationFn: (data: Build) => {
      return axios.post("http://localhost:8000/api/build/", data, {
        withCredentials: true,
      });
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        console.log(error);

        toast.error("Error", {
          description: error.response?.data.message || error.response?.data,
        });
      } else {
        toast.error("Error", {
          description: "Something went wrong",
        });
      }
    },
  });

  const updateBuild = useMutation({
    mutationFn: (data: Build) => {
      return axios.put(`http://localhost:8000/api/build/${id}`, data, {
        withCredentials: true,
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
    mutationFn: (data: { build_id: string; image_id: string; url: string }) => {
      return axios.delete(
        `http://localhost:8000/api/build/${data.build_id}/image/${data.image_id}?url=${data.url}`,
        {
          withCredentials: true,
        }
      );
    },
    onSuccess: () => {
      context.invalidateQueries({ queryKey: ["build", id] });
    },
  });

  const incrementView = useMutation({
    mutationFn: (data: { build_id: string }) => {
      return axios.post(
        `http://localhost:8000/api/build/${data.build_id}/view`,
        {},
        {
          withCredentials: true,
        }
      );
    },

    onSuccess: () => {
      context.invalidateQueries({ queryKey: ["build", id] });
    },
  });

  const likeBuild = useMutation({
    mutationFn: (data: { build_id: string }) => {
      return axios.post(
        `http://localhost:8000/api/build/${data.build_id}/like`,
        {},
        {
          withCredentials: true,
        }
      );
    },
    onSuccess: () => {
      context.invalidateQueries({ queryKey: ["build", id] });
    },
  });

  const dislikeBuild = useMutation({
    mutationFn: (data: { build_id: string }) => {
      return axios.post(
        `http://localhost:8000/api/build/${data.build_id}/dislike`,
        {},
        {
          withCredentials: true,
        }
      );
    },
    onSuccess: () => {
      context.invalidateQueries({ queryKey: ["build", id] });
    },
  });

  const deleteBuild = useMutation({
    mutationFn: (data: { build_id: string }) => {
      return axios.delete(
        `http://localhost:8000/api/build/${data.build_id}/delete`,
        {
          withCredentials: true,
        }
      );
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

  return {
    createBuild,
    getById,
    update: updateBuild,
    removeImage,
    incrementView,
    likeBuild,
    dislikeBuild,
    deleteBuild,
  };
};
