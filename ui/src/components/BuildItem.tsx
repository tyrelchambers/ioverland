import { Build } from "@/types";
import Link from "next/link";
import React from "react";
import ImageWithFallback from "./ImageWithFallback";
import { Video } from "lucide-react";

const BuildItem = ({
  build,
  footer,
}: {
  build: Build;
  footer?: JSX.Element;
}) => {
  console.log(build);

  return (
    <Link href={`/build/${build.uuid}`} key={build.uuid}>
      <header className="relative h-[240px] shadow-md">
        {build.banner?.mime_type.includes("image") ? (
          <ImageWithFallback url={build.banner?.url} />
        ) : (
          <div className="w-full h-full bg-gradient-to-tr from-gray-300 to-muted  text-muted-foreground flex flex-col p-8 justify-center items-center">
            <Video />
            <p className="text-balance text-center mt-4">
              Banner is a video. To save space, it won&apos;t be displayed here.
            </p>
          </div>
        )}
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
