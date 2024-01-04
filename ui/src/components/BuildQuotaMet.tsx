import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import React from "react";

const BuildQuotaMet = () => {
  return (
    <div className="flex flex-col lg:flex-row bg-warning text-warning-foreground p-6 rounded-xl gap-4 shadow-lg">
      <AlertTriangle />
      <div className="flex flex-col gap-2">
        <p className="font-bold">Too many builds</p>
        <p className="text-warning-foreground/70 text-sm">
          It looks like you have too many builds associated with your account.
          Please delete one to create a new build.
        </p>
        <Link href="/dashboard" className="underline text-sm">
          View my builds
        </Link>
      </div>
    </div>
  );
};

export default BuildQuotaMet;
