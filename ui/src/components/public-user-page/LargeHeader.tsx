import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { User } from "lucide-react";
import { H1 } from "../Heading";
import { Account, Media, PublicProfile } from "@/types";
import Image from "next/image";
import { Button } from "../ui/button";
import { format } from "date-fns";
import { useDomainUser } from "@/hooks/useDomainUser";
import FollowBtn from "../FollowBtn";

const LargeHeader = ({
  data,
  banner,
}: {
  data: PublicProfile;
  banner: Media | undefined;
}) => {
  return (
    <header className="max-w-screen-xl mx-auto w-full my-6  flex-col items-center hidden lg:flex p-4">
      {banner?.url ? (
        <div className="w-full aspect-video h-[450px]  rounded-xl relative overflow-hidden">
          <Image src={banner.url} alt="" fill objectFit="cover" priority />
        </div>
      ) : (
        <div className="w-full aspect-video h-[450px] bg-gradient-to-t from-zinc-200 to-zinc-100 rounded-xl"></div>
      )}
      <div className="flex justify-between w-full ">
        <div className="flex h-12 mt-3 gap-4 items-center w-[350px]">
          <span className="flex gap-2 text-muted-foreground items-center text-sm">
            <span className="font-bold text-base text-foreground">
              {data.views}
            </span>
            views
          </span>

          <span className="flex gap-2 text-muted-foreground items-center">
            <span className="font-bold text-base text-foreground">
              {data.followers?.length ?? 0}
            </span>
            followers
          </span>
        </div>
        <div className="-translate-y-[calc(5rem+8px)] flex flex-col items-center flex-1">
          <Avatar className="w-40 h-40 border-8 border-white  shadow-xl">
            <AvatarFallback>
              <User />
            </AvatarFallback>
            <AvatarImage src={data.avatar} fetchPriority="high" />
          </Avatar>
          <H1 className="mt-6">{data.username}</H1>

          {data.bio && (
            <p className="text-muted-foreground text-sm">{data.bio}</p>
          )}

          {data.created_at && (
            <p className="italic text-muted-foreground mt-2 text-sm">
              Since {format(new Date(data.created_at), "MMMM yyyy")}
            </p>
          )}
        </div>

        <div className="flex h-12 mt-3 w-[350px] justify-end">
          <FollowBtn data={data} />
        </div>
      </div>
    </header>
  );
};

export default LargeHeader;
