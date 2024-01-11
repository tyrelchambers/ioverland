import { useBilling } from "@/hooks/useBilling";
import { useRouter } from "next/router";
import React, { useEffect } from "react";

const Onboard = () => {
  const { plan } = useRouter().query;
  const billingLink = useBilling(plan as string);

  useEffect(() => {
    if (billingLink.billing.data) {
      window.location.href = billingLink.billing.data.url;
    }
  }, [billingLink.billing.data]);

  return null;
};

export default Onboard;
