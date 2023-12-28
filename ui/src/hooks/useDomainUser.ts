import { Account, DomainUser } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
export const useDomainUser = (id?: string) => {
  const context = useQueryClient();
  const query = useQuery({
    queryKey: ["me"],
    queryFn: (): Promise<DomainUser> => {
      return axios
        .get(`http://localhost:8000/api/user/me`, {
          withCredentials: true,
        })
        .then((res) => res.data);
    },
  });

  const bookmark = useMutation({
    mutationFn: ({ build_id }: { build_id: string }) => {
      return axios.post(
        `http://localhost:8000/api/user/me/bookmark`,
        {
          build_id,
        },
        {
          withCredentials: true,
        }
      );
    },
    onSuccess: () => {
      context.invalidateQueries({ queryKey: ["me", id] });
    },
  });

  const removeBookmark = useMutation({
    mutationFn: ({ build_id }: { build_id: string }) => {
      return axios.post(
        `http://localhost:8000/api/user/me/remove-bookmark`,
        {
          build_id,
        },
        {
          withCredentials: true,
        }
      );
    },
    onSuccess: () => {
      context.invalidateQueries({ queryKey: ["me"] });
    },
  });

  const getAccount = useQuery({
    queryKey: ["stripe-account"],
    queryFn: (): Promise<Account> => {
      return axios
        .get(`http://localhost:8000/api/user/me/stripe`, {
          withCredentials: true,
        })
        .then((res) => res.data);
    },
  });

  return {
    user: query,
    bookmark,
    removeBookmark,
    getAccount,
  };
};
