import { cn } from "@/lib/utils";
import { Media } from "@/types";
import Image from "next/image";
import React from "react";
import EmptyListText from "../EmptyListText";

const Photos = ({ photos }: { photos: Media[] | undefined }) => {
  if (!photos || photos.length === 0) return <EmptyListText text="No photos" />;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {photos?.map((photo, i) => (
        <div key={photo.id} className="flex items-center x">
          {photo.mime_type.includes("image") ? (
            <a
              href={photo.url}
              target="_blank"
              className={cn(
                "relative  w-full aspect-square overflow-hidden h-full shadow-xl flex",
                i % 2 && "lg:mt-[100px]"
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
