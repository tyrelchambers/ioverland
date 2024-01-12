import { Zap } from "lucide-react";
import React from "react";
import { Badge } from "../ui/badge";
import { format } from "date-fns";
import { Account } from "@/types";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";

export const SubscriptionSekelton = () => (
  <Skeleton className="w-full h-[300px] mt-6" />
);

const Subscription = ({
  account,
  getPortalLink,
}: {
  account: Account;
  getPortalLink: () => void;
}) => {
  return (
    <div className="mt-10 flex flex-col p-6 rounded-xl w-full bg-gradient-to-tr from-blue-900 to-blue-500 shadow-lg">
      <Zap className="text-white mb-4" />
      <p className="text-white text-xl">
        You are currently subscribed to the {account.subscription.name} plan!
      </p>
      <p className="text-white text-2xl my-4 font-black">
        ${account.subscription.price / 100}/month
      </p>
      <Badge variant="outline" className="text-sm  text-background w-fit">
        Next invoice date:{" "}
        {format(
          new Date(account.subscription.next_invoice_date),
          "MMMM dd, yyyy"
        )}
      </Badge>
      <Button
        type="button"
        variant="secondary"
        className="mt-3"
        onClick={getPortalLink}
      >
        Manage subscription
      </Button>
    </div>
  );
};

export default Subscription;
