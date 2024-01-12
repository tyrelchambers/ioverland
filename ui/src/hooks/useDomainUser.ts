import { request } from "@/lib/axios";
import { Account, DomainUser } from "@/types";
import { useAuth } from "@clerk/nextjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
export const useDomainUser = (id?: string) => {
  const { getToken, userId } = useAuth();

  const context = useQueryClient();
  const query = useQuery({
    queryKey: ["me"],
    queryFn: async (): Promise<DomainUser> => {
      return request
        .get(`/api/user/me`, {
          headers: {
            Authorization: `Bearer ${await getToken()}`,
          },
        })
        .then((res) => res.data);
    },
    enabled: !!userId,
  });

  const bookmark = useMutation({
    mutationFn: async ({ build_id }: { build_id: string }) => {
      return request.post(
        `/api/user/me/bookmark`,
        {
          build_id,
        },
        {
          headers: {
            Authorization: `Bearer ${await getToken()}`,
          },
        }
      );
    },
    onSuccess: () => {
      context.invalidateQueries({ queryKey: ["me", id] });
    },
  });

  const removeBookmark = useMutation({
    mutationFn: async ({ build_id }: { build_id: string }) => {
      return request.post(
        `/api/user/me/remove-bookmark`,
        {
          build_id,
        },
        {
          headers: {
            Authorization: `Bearer ${await getToken()}`,
          },
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
      return request
        .get(`/api/user/me/account`, {
          headers: {
            Authorization: `Bearer ${await getToken()}`,
          },
        })
        .then((res) => res.data);
    },
    enabled: !!userId,
  });

  const createPortal = useMutation({
    mutationFn: async (): Promise<{ url: string }> => {
      return request
        .post(
          `/api/billing/portal`,
          {},
          {
            headers: {
              Authorization: `Bearer ${await getToken()}`,
            },
          }
        )
        .then((res) => res.data);
    },
  });

  const deleteUser = useMutation({
    mutationFn: async () => {
      return request
        .delete(`/api/user/me`, {
          headers: {
            Authorization: `Bearer ${await getToken()}`,
          },
        })
        .then((res) => res.data);
    },
    onSuccess: () => {
      toast.success("Account set to delete", {
        description: "Your account has been scheduled for deletion.",
      });
      context.invalidateQueries({ queryKey: ["me"] });
      context.invalidateQueries({ queryKey: ["account"] });
      window.location.reload();
    },
  });

  const restoreUser = useMutation({
    mutationFn: async () => {
      return request
        .post(
          `/api/user/me/restore`,
          {},
          {
            headers: {
              Authorization: `Bearer ${await getToken()}`,
            },
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

  const createCheckoutLink = useMutation({
    mutationFn: async ({
      redirect_to,
      plan,
    }: {
      redirect_to?: string;
      plan?: string;
    }) => {
      return request
        .post(
          `/api/billing/checkout?redirect_to=${redirect_to}&plan=${plan}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${await getToken()}`,
            },
          }
        )
        .then((res) => res.data);
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
    createCheckoutLink,
  };
};
