import { ImageIcon } from "lucide-react";
import Image from "next/image";
import React from "react";
import StyledBlock from "./StyledBlock";

interface Props {
  url?: string;
}
const ImageWithFallback = ({ url }: Props) => {
  return url ? (
    <Image src={url} alt="" fill objectFit="cover" priority />
  ) : (
    <StyledBlock icon={<ImageIcon />} />
  );
};

export default ImageWithFallback;
