import { Media } from "@/types";
import React from "react";
import ImageWithFallback from "./ImageWithFallback";

const RenderMedia = ({
  media,
  videoControls,
  autoPlay,
  loop,
}: {
  media?: Media;
  videoControls?: boolean;
  autoPlay?: boolean;
  loop?: boolean;
}) => {
  if (media?.mime_type.includes("image") || !media?.url) {
    return <ImageWithFallback url={media?.url} />;
  }

  return (
    <video controls={videoControls} autoPlay={autoPlay} muted loop={loop}>
      <source src={media.url} type={media.mime_type} />
    </video>
  );
};

export default RenderMedia;
