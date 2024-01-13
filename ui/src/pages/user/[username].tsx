import BuildItem, { BuildSkeleton } from "@/components/BuildItem";
import Header from "@/components/Header";
import { H1, H2 } from "@/components/Heading";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useDomainUser } from "@/hooks/useDomainUser";
import axios from "axios";
import { format } from "date-fns";
import { Eye, Heart, User } from "lucide-react";
import { useRouter } from "next/router";
import React from "react";

const Profile = () => {
  const { username } = useRouter().query;

  const { publicUser } = useDomainUser({ username: username as string });

  return (
    <div>
      <Header />

      <header className="max-w-screen-xl mx-auto w-full my-6 flex flex-col items-center">
        <div className="w-full aspect-video h-[450px] bg-gradient-to-t from-zinc-200 to-zinc-100 rounded-xl"></div>
        <div className="flex justify-between w-full ">
          <div className="flex h-12 mt-3 gap-4 items-center w-[350px]">
            <span className="flex gap-2 text-muted-foreground items-center text-sm">
              <span className="font-bold text-base text-foreground">
                {publicUser.data?.views}
              </span>
              views
            </span>

            <span className="flex gap-2 text-muted-foreground items-center">
              <span className="font-bold text-base text-foreground">
                {publicUser.data?.followers}
              </span>
              followers
            </span>
          </div>
          <div className="-translate-y-[calc(5rem+8px)] flex flex-col items-center flex-1">
            <Avatar className="w-40 h-40 border-8 border-white  shadow-xl">
              <AvatarFallback>
                <User />
              </AvatarFallback>
              <AvatarImage src={publicUser?.data?.avatar} />
            </Avatar>
            <H1 className="mt-6">{publicUser.data?.username}</H1>

            {publicUser.data?.bio && (
              <p className="text-muted-foreground text-sm">
                {publicUser.data?.bio}
              </p>
            )}

            {publicUser.data?.created_at && (
              <p className="italic text-muted-foreground mt-2 text-sm">
                Since{" "}
                {format(new Date(publicUser.data?.created_at), "MMMM yyyy")}
              </p>
            )}
          </div>

          <div className="flex h-12 mt-3 w-[350px] justify-end">
            <Button>Follow</Button>
          </div>
        </div>
      </header>

      <section className="max-w-screen-xl mx-auto">
        <H2 className="mb-10">Builds</H2>

        {publicUser.isLoading ? (
          <ul className="grid grid-cols-1 lg:grid-cols-3 lg:p-0 p-4 gap-6">
            <BuildSkeleton />
            <BuildSkeleton />
            <BuildSkeleton />
          </ul>
        ) : publicUser.data?.builds && publicUser.data?.builds.length > 0 ? (
          <ul className="grid grid-cols-1 lg:grid-cols-3 lg:p-0 p-4 gap-6">
            {publicUser.data?.builds
              ?.toSorted((a, b) => (a.name > b.name ? 1 : -1))
              ?.map((build) => (
                <BuildItem build={build} key={build.uuid} />
              ))}
          </ul>
        ) : (
          <p className="text-card-foreground bg-card p-4 rounded-xl w-full mt-4">
            No builds to see here
          </p>
        )}
      </section>
    </div>
  );
};

export default Profile;
