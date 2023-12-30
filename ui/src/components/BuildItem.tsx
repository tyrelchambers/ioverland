import { Build } from "@/types";
import Link from "next/link";
import React from "react";
import ImageWithFallback from "./ImageWithFallback";
import { Video } from "lucide-react";

const BuildItem = ({
  build,
  footer,
  playVideo,
}: {
  build: Build;
  footer?: JSX.Element;
  playVideo?: boolean;
}) => {
  const getImageOrVideo = () => {
    console.log(build.banner?.url);

    if (build.banner?.mime_type.includes("video")) {
      if (!playVideo) {
        return (
          <div className="w-full h-full bg-gradient-to-tr from-gray-300 to-muted  text-muted-foreground flex flex-col p-8 justify-center items-center dark:text-background">
            <Video />
            <p className="text-balance text-center mt-4">
              Banner is a video. To save space, it won&apos;t be displayed here.
            </p>
          </div>
        );
      } else {
        return (
          <video muted loop autoPlay>
            <source src={build.banner?.url} type={build.banner?.mime_type} />
          </video>
        );
      }
    }

    return <ImageWithFallback url={build.banner?.url} />;
  };

  return (
    <Link href={`/build/${build.uuid}`} key={build.uuid}>
      <header className="relative w-full aspect-video shadow-md">
        {getImageOrVideo()}
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
