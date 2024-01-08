import { ExternalLink } from "lucide-react";
import Link from "next/link";
import React from "react";

export const MaxFileSizeText = ({
  isProPlan,
  additional,
  maxFileSize,
}: {
  isProPlan: boolean | undefined;
  additional?: string;
  maxFileSize: string | undefined;
}) => {
  if (isProPlan) {
    return (
      <p className="text-muted-foreground text-sm mb-1">
        Max file size is: {maxFileSize}. {additional}
      </p>
    );
  }

  return (
    <p className="text-muted-foreground text-sm mb-1">
      Max file size is: {maxFileSize}. {additional} Increase your file size to{" "}
      300Mb by signing up for a pro subscription.{" "}
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
