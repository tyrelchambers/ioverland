import { useAuth } from "@clerk/nextjs";
import axios from "axios";
import { env } from "next-runtime-env";

export const useApi = () => {
  const { getToken } = useAuth();
  const request = async () => {
    return axios.create({
      baseURL: env("NEXT_PUBLIC_BACKEND_URL"),
      headers: {
        Authorization: `Bearer ${await getToken()}`,
      },
    });
  };

  return { request: request() };
};
