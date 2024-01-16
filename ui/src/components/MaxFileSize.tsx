import { ExternalLink, Info } from "lucide-react";
import Link from "next/link";
import React from "react";

export const MaxFileSizeText = ({
  isProPlan,
  maxFileUploads,
  maxFileSize,
  type,
  remainingPhotos,
  showLink,
}: {
  isProPlan?: boolean | undefined;
  maxFileUploads: number | undefined;
  maxFileSize: string | undefined;
  type?: "banner";
  remainingPhotos?: number;
  showLink?: boolean;
}) => {
  return (
    <div className="bg-indigo-100 p-4 rounded-md border-2 border-indigo-500 flex flex-col lg:flex-row items-center justify-between mb-3">
      <div className="flex flex-wrap gap-3 items-center text-indigo-500">
        <Info size={16} />
        <p className=" text-sm ">
          <span className="font-bold">{maxFileSize}</span> / file
        </p>
        <p className=" text-sm ">
          Max <span className="font-bold">{maxFileUploads}</span> files
        </p>

        {remainingPhotos && (
          <div className="px-3 py-1 text-white rounded-full text-xs bg-indigo-500 flex-1 text-center lg:flex-none">
            {remainingPhotos} remaining
          </div>
        )}
      </div>

      {!isProPlan && type !== "banner" && showLink && (
        <Link
          href="/dashboard?tab=account"
          className="text-indigo-500 text-sm flex gap-2 items-center underline mt-4 lg:mt-0"
          target="_blank"
        >
          <ExternalLink size={16} />
          Want more?
        </Link>
      )}
    </div>
  );
};
