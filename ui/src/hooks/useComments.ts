import { request } from "@/lib/axios";
import { useAuth } from "@clerk/nextjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { toast } from "sonner";

export const useComments = ({
  buildId,
  replyId,
}: {
  buildId: string;
  replyId?: string;
}) => {
  const context = useQueryClient();
  const { getToken } = useAuth();
  const post = useMutation({
    mutationFn: async ({ comment }: { comment: string }) => {
      return request.post(
        `/api/comment/create`,
        {
          comment,
          build_id: buildId,
          reply_id: replyId,
        },
        {
          headers: {
            Authorization: `Bearer ${await getToken()}`,
          },
        }
      );
    },
    onSuccess: () => {
      toast.success("Comment posted");
      context.invalidateQueries({ queryKey: ["build_comments", buildId] });
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        toast.error(error.response?.data.error);
      }
    },
  });

  const like = useMutation({
    mutationFn: async ({ comment_id }: { comment_id: string }) => {
      return request.patch(
        `/api/comment/${comment_id}/like`,
        {},
        {
          headers: {
            Authorization: `Bearer ${await getToken()}`,
          },
        }
      );
    },
    onSuccess: () => {
      context.invalidateQueries({ queryKey: ["build_comments", buildId] });
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        toast.error(error.response?.data.error);
      }
    },
  });

  const dislikeComment = useMutation({
    mutationFn: async ({ comment_id }: { comment_id: string }) => {
      return request.patch(
        `/api/comment/${comment_id}/dislike`,
        {},
        {
          headers: {
            Authorization: `Bearer ${await getToken()}`,
          },
        }
      );
    },
    onSuccess: () => {
      context.invalidateQueries({ queryKey: ["build_comments", buildId] });
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        toast.error(error.response?.data.error);
      }
    },
  });

  const deleteComment = useMutation({
    mutationFn: async ({ comment_id }: { comment_id: string }) => {
      return request.delete(`/api/comment/${comment_id}/delete`, {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
        },
      });
    },
    onSuccess: () => {
      context.invalidateQueries({ queryKey: ["build_comments", buildId] });
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        toast.error(error.response?.data.error);
      }
    },
  });

  return { post, likeComment: like, dislikeComment, deleteComment };
};
