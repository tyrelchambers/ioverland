import { Build } from "@/types";
import Link from "next/link";
import React from "react";
import ImageWithFallback from "./ImageWithFallback";

const BuildItem = ({
  build,
  footer,
}: {
  build: Build;
  footer?: JSX.Element;
}) => {
  return (
    <Link
      href={`/build/${build.uuid}`}
      key={build.uuid}
      className="builds-item"
    >
      <div>
        <header className="relative h-[240px] shadow-md">
          <ImageWithFallback url={build.banner?.url} />
        </header>
        <p className="mt-3 font-bold text-xl font-serif text-foreground">
          {build.name}
        </p>
        <p className="text-muted-foreground line-clamp-3 text-sm mt-1">
          {build.description}
        </p>

        {footer}
      </div>
    </Link>
  );
};

export default BuildItem;
