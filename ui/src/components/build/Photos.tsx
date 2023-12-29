import { cn } from "@/lib/utils";
import { Media } from "@/types";
import Image from "next/image";
import React from "react";
import EmptyListText from "../EmptyListText";

const Photos = ({ photos }: { photos: Media[] | undefined }) => {
  if (!photos || photos.length === 0) return <EmptyListText text="No photos" />;

  return (
    <div className="grid grid-cols-2 gap-8">
      {photos?.map((photo, i) =>
        photo.mime_type.includes("image") ? (
          <a
            href={photo.url}
            target="_blank"
            key={photo.uuid}
            className={cn(
              "relative  w-full aspect-square overflow-hidden shadow-xl ",
              i % 2 && "mt-[100px]"
            )}
          >
            <Image src={photo.url} alt="" fill className="object-cover" />
          </a>
        ) : (
          <video key={photo.uuid} controls muted>
            <source src={photo.url} type={photo.mime_type} />
          </video>
        )
      )}
    </div>
  );
};

export default Photos;
