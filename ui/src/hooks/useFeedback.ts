import { request } from "@/lib/axios";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export const useFeedback = () => {
  const send = useMutation({
    mutationFn: async ({
      name,
      email,
      message,
      type,
    }: {
      name: string;
      email: string;
      message: string;
      type: string;
    }) => {
      return request.post("/api/feedback", { name, email, message, type });
    },
    onSuccess: () => {
      toast.success("Feedback sent, thank you!");
    },
    onError: () => {
      toast.error("Failed to send feedback");
    },
  });

  return {
    send,
  };
};
