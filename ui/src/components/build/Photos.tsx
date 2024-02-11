import { cn } from "@/lib/utils";
import { Media } from "@/types";
import Image from "next/image";
import React from "react";
import EmptyListText from "../EmptyListText";

const Photos = ({
  photos,
  cols = 2,
}: {
  photos: Media[] | undefined;
  cols?: number;
}) => {
  if (!photos || photos.length === 0) return <EmptyListText text="No photos" />;

  return (
    <div
      className={`grid grid-cols-1 lg:grid-cols-2 gap-8 photo-list`}
      style={{
        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
      }}
    >
      {photos?.map((photo, i) => (
        <div key={photo.id} className="flex items-center photo-list-item">
          {photo.mime_type.includes("image") ? (
            <a
              href={photo.url}
              target="_blank"
              className={cn(
                "relative rounded-xl w-full aspect-square overflow-hidden h-full shadow-xl flex"
              )}
            >
              <Image src={photo.url} alt="" fill className="object-cover" />
            </a>
          ) : (
            <video
              key={photo.id}
              controls
              muted
              className="flex items-center h-full"
            >
              <source src={photo.url} type={photo.mime_type} />
            </video>
          )}
        </div>
      ))}
    </div>
  );
};

export default Photos;
