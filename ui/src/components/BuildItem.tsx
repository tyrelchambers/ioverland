import { Build } from "@/types";
import Link from "next/link";
import React from "react";
import RenderMedia from "./RenderMedia";
import { Skeleton } from "./ui/skeleton";

export const BuildSkeleton = () => (
  <div className="flex flex-col gap-3">
    <Skeleton className="w-full aspect-video" />

    <Skeleton className="h-5 w-full" />
    <Skeleton className="h-5 w-full" />
  </div>
);

const BuildItem = ({
  build,
  footer,
  playVideo,
  actions,
  showDescription = true,
}: {
  build: Build;
  footer?: JSX.Element;
  playVideo?: boolean;
  actions?: JSX.Element;
  showDescription?: boolean;
}) => {
  return (
    <Link href={`/build/${build.uuid}`} key={build.uuid}>
      <header className="relative w-full aspect-video shadow-md rounded-md overflow-hidden">
        <RenderMedia media={build.banner} autoPlay={playVideo} />
      </header>
      <div className="flex mt-3 justify-between">
        <p className="font-bold text-xl font-sans text-foreground">
          {build.name}
        </p>

        {actions}
      </div>
      {showDescription && (
        <p className="text-muted-foreground line-clamp-3 text-sm mt-1">
          {build.description}
        </p>
      )}
      {build.sample && (
        <p className="text-muted-foreground text-sm italic mt-1">
          This build is a sample
        </p>
      )}

      {footer}
    </Link>
  );
};

export default BuildItem;
