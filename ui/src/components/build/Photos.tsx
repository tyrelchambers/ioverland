import { cn } from "@/lib/utils";
import { Media } from "@/types";
import Image from "next/image";
import React from "react";

const Photos = ({ photos }: { photos: Media[] | undefined }) => {
  if (!photos) return null;

  return (
    <div className="grid grid-cols-2 gap-8">
      {photos?.map((photo, i) => (
        <a
          href={photo.url}
          target="_blank"
          key={photo.uuid}
          className={cn(
            "relative  w-full aspect-square rounded-xl overflow-hidden shadow-xl ",
            i % 2 && "mt-[100px]"
          )}
        >
          <Image src={photo.url} alt="" fill className="object-cover" />
        </a>
      ))}
    </div>
  );
};

export default Photos;
