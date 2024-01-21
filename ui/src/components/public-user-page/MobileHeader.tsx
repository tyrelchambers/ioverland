import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { User } from "lucide-react";
import { H1 } from "../Heading";
import { Media, PublicProfile } from "@/types";
import Image from "next/image";
import { format } from "date-fns";
import FollowBtn from "../FollowBtn";

const MobileHeader = ({
  data,
  banner,
}: {
  data: PublicProfile;
  banner: Media | undefined;
}) => {
  return (
    <header className="max-w-screen-xl mx-auto w-full my-6 flex flex-col items-center p-4 lg:hidden">
      {banner?.url ? (
        <div className="w-full aspect-video h-[450px]  rounded-xl relative overflow-hidden">
          <Image src={banner.url} alt="" fill objectFit="cover" priority />
        </div>
      ) : (
        <div className="w-full aspect-video h-[450px] bg-gradient-to-t from-zinc-200 to-zinc-100 rounded-xl"></div>
      )}
      <div className="flex flex-col md:flex-row items-center md:items-start justify-between w-full mt-3">
        <div className=" flex flex-col md:flex-row items-center md:items-start flex-1">
          <Avatar className="w-20 h-20 md:mr-4 border-4 border-white  shadow-xl">
            <AvatarFallback>
              <User />
            </AvatarFallback>
            <AvatarImage src={data.avatar} fetchPriority="high" />
          </Avatar>
          <div className="flex flex-col">
            <H1>{data.username}</H1>
            {data.bio && (
              <p className="text-muted-foreground text-sm text-center">
                {data.bio}
              </p>
            )}

            {data.created_at && (
              <p className="italic text-muted-foreground text-sm text-center md:text-left">
                Since {format(new Date(data.created_at), "MMMM yyyy")}
              </p>
            )}
            <div className="flex h-12 gap-4 items-center justify-center md:justify-start">
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
          </div>
        </div>

        <div className="flex h-12 mt-3 p-3">
          <FollowBtn data={data} />
        </div>
      </div>
    </header>
  );
};

export default MobileHeader;
