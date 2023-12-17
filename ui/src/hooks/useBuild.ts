import { toast } from "@/components/ui/use-toast";
import { Build } from "@/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios, { AxiosResponse, isAxiosError } from "axios";

export const useBuild = (id?: string) => {
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
        toast({
          variant: "destructive",
          title: "Error",
          description: error.response?.data.message,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
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
  });

  return { createBuild, getById, update: updateBuild };
};
