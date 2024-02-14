import { Adventure, Build } from "@/types";
import Link from "next/link";
import React from "react";
import RenderMedia from "./RenderMedia";
import { Skeleton } from "./ui/skeleton";

export const AdventureSkeleton = () => (
  <div className="flex flex-col gap-3">
    <Skeleton className="w-full aspect-video" />
    <Skeleton className="h-5 w-full" />
    <Skeleton className="h-5 w-full" />
  </div>
);

const AdventureItem = ({
  adventure,
  footer,
  playVideo,
  actions,
}: {
  adventure: Adventure;
  footer?: JSX.Element;
  playVideo?: boolean;
  actions?: JSX.Element;
}) => {
  return (
    <Link href={`/adventure/${adventure.uuid}`} key={adventure.uuid}>
      <header className="relative w-full aspect-video shadow-md rounded-md">
        <RenderMedia media={adventure.photos?.[0]} autoPlay={playVideo} />
      </header>
      <div className="flex mt-3 justify-between">
        <p className="font-bold text-xl font-sans text-foreground">
          {adventure.name}
        </p>

        {actions}
      </div>
      <p className="text-muted-foreground line-clamp-3 text-sm mt-1">
        {adventure.summary}
      </p>

      {footer}
    </Link>
  );
};

export default AdventureItem;
