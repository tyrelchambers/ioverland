import { Media } from "@/types";
import Image from "next/image";
import React from "react";
import { Button } from "../ui/button";
import { ImageIcon, Trash } from "lucide-react";
import StyledBlock from "../StyledBlock";

interface Props {
  photos: Media[] | undefined;
  removeImageHandler: (
    image_id: string | undefined,
    url: string | undefined
  ) => void;
}

const PhotosList = ({ photos, removeImageHandler }: Props) => {
  return (
    <>
      {photos && photos.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {photos?.map((photo, index) => {
            return (
              <div
                className=" flex flex-col items-center gap-4 relative  shadow-xl rounded-xl overflow-hidden"
                key={photo.id}
              >
                {photo.mime_type.includes("image") ? (
                  <div className="relative w-full h-[200px]">
                    <Image
                      src={photo.url}
                      alt=""
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <video controls className="h-[200px] w-full">
                    <source src={photo.url} type={photo.mime_type} />
                  </video>
                )}
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => removeImageHandler(photo.id, photo.url)}
                >
                  <Trash size={18} />
                </Button>
              </div>
            );
          })}
        </div>
      ) : (
        <StyledBlock
          text="No uploaded photos for this build."
          icon={<ImageIcon />}
        />
      )}
    </>
  );
};

export default PhotosList;
