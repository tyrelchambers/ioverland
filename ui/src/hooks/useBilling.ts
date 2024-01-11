import { request } from "@/lib/axios";
import { useAuth } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";

export const useBilling = (plan: string) => {
  const { getToken } = useAuth();

  const billingQ = useQuery({
    queryKey: ["billing"],
    queryFn: async (): Promise<{ url: string }> => {
      return request
        .get(`/api/billing/checkout?plan=${plan}`, {
          headers: {
            Authorization: `Bearer ${await getToken()}`,
          },
        })
        .then((res) => res.data);
    },
    enabled: !!plan,
  });

  return {
    billing: billingQ,
  };
};
