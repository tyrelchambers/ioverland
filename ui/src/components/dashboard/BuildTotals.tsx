import { Account } from "@/types";
import React from "react";
import { Skeleton } from "../ui/skeleton";

export const BuildTotalsSkeleton = () => {
  return (
    <div className="p-6 rounded-xl border border-border mt-6">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-4 w-1/3" />
    </div>
  );
};

const BuildTotals = ({ account }: { account: Account | undefined }) => {
  return (
    <div className="p-6 rounded-xl border border-border mt-6">
      <p className="text-muted-foreground">
        You have{" "}
        <span className="font-black text-foreground">
          {account?.total_builds} builds
        </span>{" "}
        in total.
        {account?.builds_remaining !== -1 && (
          <p>
            You also have{" "}
            <span className="font-black text-foreground">
              {account?.builds_remaining} builds remaining.
            </span>{" "}
          </p>
        )}
      </p>

      {!account?.has_subscription && (
        <p className="text-muted-foreground text-sm mt-4 italic">
          Since you&apos;re on the free plan, you can only have one build. If
          you&apos;d like to create more, please sign up for the Pro
          subscription.
        </p>
      )}
    </div>
  );
};

export default BuildTotals;
