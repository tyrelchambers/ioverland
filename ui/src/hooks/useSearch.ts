import { request } from "@/lib/axios";
import { Build, ClerkUser } from "@/types";
import { User } from "@clerk/nextjs/server";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useEffect, useState } from "react";

export const useSearch = (query: string) => {
  const search = useQuery({
    queryKey: ["search", query],
    queryFn: async () => {
      const { data } = await request.get<Build[] | ClerkUser[]>("/api/search", {
        params: {
          query: query,
        },
      });
      return data;
    },
    enabled: !!query,
  });
  return {
    search,
  };
};
