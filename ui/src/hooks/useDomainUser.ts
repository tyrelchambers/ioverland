import { request } from "@/lib/axios";
import { Account, DomainUser } from "@/types";
import { useAuth } from "@clerk/nextjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
export const useDomainUser = (id?: string) => {
  const { getToken } = useAuth();

  const context = useQueryClient();
  const query = useQuery({
    queryKey: ["me"],
    queryFn: (): Promise<DomainUser> => {
      return request
        .get(`/api/user/me`, {
          withCredentials: true,
        })
        .then((res) => res.data);
    },
  });

  const bookmark = useMutation({
    mutationFn: ({ build_id }: { build_id: string }) => {
      return request.post(
        `/api/user/me/bookmark`,
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
      return request.post(
        `/api/user/me/remove-bookmark`,
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
    queryKey: ["account"],
    queryFn: async (): Promise<Account> => {
      return axios
        .get(`https://api.iover.land/api/user/me/account`, {
          headers: {
            Authorization: `Bearer ${await getToken()}`,
          },
        })
        .then((res) => res.data);
    },
  });

  const createPortal = useMutation({
    mutationFn: (): Promise<{ url: string }> => {
      return request
        .post(
          `/api/billing/portal`,
          {},
          {
            withCredentials: true,
          }
        )
        .then((res) => res.data);
    },
  });

  const deleteUser = useMutation({
    mutationFn: () => {
      return request
        .delete(`/api/user/me`, {
          withCredentials: true,
        })
        .then((res) => res.data);
    },
    onSuccess: () => {
      toast.error("Account set to delete", {
        description: "Your account has been scheduled for deletion.",
      });
      context.invalidateQueries({ queryKey: ["me"] });
      context.invalidateQueries({ queryKey: ["account"] });
    },
  });

  const restoreUser = useMutation({
    mutationFn: () => {
      return request
        .post(
          `/api/user/me/restore`,
          {},
          {
            withCredentials: true,
          }
        )
        .then((res) => res.data);
    },
    onSuccess: () => {
      toast.success("Account restored", {
        description: "Your account has been restored.",
      });
      context.invalidateQueries({ queryKey: ["me"] });
      context.invalidateQueries({ queryKey: ["account"] });
    },
  });

  return {
    user: query,
    bookmark,
    removeBookmark,
    account: getAccount,
    createPortal,
    deleteUser,
    restoreUser,
  };
};
