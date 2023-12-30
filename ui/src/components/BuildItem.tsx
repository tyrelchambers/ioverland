import { Build } from "@/types";
import Link from "next/link";
import React from "react";
import RenderMedia from "./RenderMedia";

const BuildItem = ({
  build,
  footer,
  playVideo,
  showVideo,
}: {
  build: Build;
  footer?: JSX.Element;
  playVideo?: boolean;
  showVideo?: boolean;
}) => {
  return (
    <Link href={`/build/${build.uuid}`} key={build.uuid}>
      <header className="relative w-full aspect-video shadow-md">
        <RenderMedia media={build.banner} autoPlay={playVideo} />
      </header>
      <p className="mt-3 font-bold text-xl font-serif text-foreground">
        {build.name}
      </p>
      <p className="text-muted-foreground line-clamp-3 text-sm mt-1">
        {build.description}
      </p>

      {footer}
    </Link>
  );
};

export default BuildItem;
