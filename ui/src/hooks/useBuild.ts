import { NewBuild } from "@/types";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosResponse } from "axios";

export const useBuild = () => {
  const createBuild = useMutation({
    mutationFn: (data: NewBuild) => {
      return axios.post("http://localhost:8000/api/build/", data, {
        withCredentials: true,
      });
    },
  });

  return { createBuild };
};
