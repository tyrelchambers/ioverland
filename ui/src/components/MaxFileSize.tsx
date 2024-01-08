import { MAX_FILE_SIZE, MAX_FILE_SIZE_PRO } from "@/constants";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import React from "react";

export const MaxFileSizeText = ({
  isProPlan,
  additional,
}: {
  isProPlan: boolean | undefined;
  additional?: string;
}) => {
  if (isProPlan) {
    return (
      <p className="text-muted-foreground text-sm mb-1">
        Max file size is: {MAX_FILE_SIZE_PRO}. {additional}
      </p>
    );
  }

  return (
    <p className="text-muted-foreground text-sm mb-1">
      Max file size is: {MAX_FILE_SIZE}. {additional} Increase your file size to{" "}
      {MAX_FILE_SIZE_PRO} by signing up for a pro subscription.{" "}
      <Link
        href="/dashboard?tab=account"
        className="flex items-baseline text-sm underline text-blue-400"
        target="_blank"
      >
        <ExternalLink size={14} className="mr-1" /> Learn more
      </Link>
    </p>
  );
};
