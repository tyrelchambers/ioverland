import { ImageIcon } from "lucide-react";
import Image from "next/image";
import React from "react";

interface Props {
  url?: string;
}
const ImageWithFallback = ({ url }: Props) => {
  return url ? (
    <Image src={url} alt="" fill objectFit="cover" />
  ) : (
    <div className="w-full h-full bg-gradient-to-tr from-gray-300 to-muted  text-muted-foreground flex justify-center items-center">
      <ImageIcon />
    </div>
  );
};

export default ImageWithFallback;
