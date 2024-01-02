import axios from "axios";
import { env } from "next-runtime-env";

export const request = axios.create({
  baseURL: env("NEXT_PUBLIC_BACKEND_URL"),
  withCredentials: true,
});
