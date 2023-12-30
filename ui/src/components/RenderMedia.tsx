import { Media } from "@/types";
import React from "react";
import ImageWithFallback from "./ImageWithFallback";
import { Video } from "lucide-react";

const RenderMedia = ({
  media,
  videoControls,
  autoPlay,
  loop,
  showVideo,
}: {
  media?: Media;
  videoControls?: boolean;
  autoPlay?: boolean;
  loop?: boolean;
  showVideo?: boolean;
}) => {
  if (media?.mime_type.includes("image") || !media?.url) {
    return <ImageWithFallback url={media?.url} />;
  }

  if (showVideo) {
    return (
      <video controls={videoControls} autoPlay={autoPlay} muted loop={loop}>
        <source src={media.url} type={media.mime_type} />
      </video>
    );
  } else {
    return (
      <div className="w-full h-full bg-gradient-to-tr from-gray-300 to-muted  text-muted-foreground flex flex-col p-8 justify-center items-center dark:text-background">
        <Video />
        <p className="text-balance text-center mt-4">
          Banner is a video. To save space, it won&apos;t be displayed here.
        </p>
      </div>
    );
  }
};

export default RenderMedia;
