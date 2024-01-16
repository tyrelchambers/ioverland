import { Build, ClerkUser, isBuild, isUser } from "@/types";
import Link from "next/link";
import React from "react";
import RenderMedia from "../RenderMedia";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { UserIcon } from "lucide-react";

const SearchItem = ({ res }: { res: Build | ClerkUser }) => {
  if (isBuild(res)) {
    return (
      <Link key={res.uuid} href={`/build/${res.uuid}`}>
        <div className="flex gap-3 items-center">
          <div className="relative h-auto w-[100px] aspect-video rounded-lg overflow-hidden">
            <RenderMedia media={res.banner} />
          </div>
          <p className="font-bold">{res.name}</p>
        </div>
      </Link>
    );
  } else if (isUser(res)) {
    return (
      <Link key={res.username} href={`/user/${res.username}`}>
        <div className="flex gap-3 items-center">
          <Avatar className="w-10 h-10 border-2 border-white  shadow-xl">
            <AvatarFallback>
              <UserIcon />
            </AvatarFallback>

            <AvatarImage src={res?.image_url} />
          </Avatar>
          <p className="font-bold">{res.username}</p>
        </div>
      </Link>
    );
  }
};

export default SearchItem;
