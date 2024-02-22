import { Build } from "@/types";
import React from "react";
import RenderMedia from "../RenderMedia";

const Large = ({ build }: { build: Build }) => {
  return (
    <div>
      <div className="w-[700px] aspect-video relative rounded-lg overflow-hidden">
        <RenderMedia media={build.banner} />
      </div>
      <p className="text-foreground text-3xl font-bold my-3">{build.name}</p>
      <p className="text-muted-foreground">{build.user?.username}</p>
    </div>
  );
};

export default Large;
