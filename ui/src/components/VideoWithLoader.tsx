import { Media } from "@/types";
import React from "react";
import { Skeleton } from "./ui/skeleton";
import { cn } from "@/lib/utils";

const VideoWithLoader = ({
  media,
  videoControls,
  autoPlay,
  loop,
  skeletonClassnames,
}: {
  media: Media | undefined;
  videoControls?: boolean;
  autoPlay?: boolean;
  loop?: boolean;
  skeletonClassnames?: string;
}) => {
  return media ? (
    <video controls={videoControls} autoPlay={autoPlay} muted loop={loop}>
      <source src={media.url} type={media.mime_type} />
    </video>
  ) : (
    <Skeleton className={cn("h-[700px]", skeletonClassnames)} />
  );
};

export default VideoWithLoader;
