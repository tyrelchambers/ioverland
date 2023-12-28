import Header from "@/components/Header";
import { H2 } from "@/components/Heading";
import BuildHeader from "@/components/build/Header";
import Links from "@/components/build/Links";
import Modifications from "@/components/build/Modifications";
import Photos from "@/components/build/Photos";
import Trips from "@/components/build/Trips";
import Vehicle from "@/components/build/Vehicle";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useBuild } from "@/hooks/useBuild";
import { hasLiked } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";
import { Heart, HeartOff } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

const Build = () => {
  const router = useRouter();
  const { user } = useUser();
  const paramId = router.query.id as string;
  const { getById, incrementView, likeBuild, dislikeBuild, bookmarkBuild } =
    useBuild(paramId);
  const [liked, setLiked] = useState<boolean | undefined>(undefined);

  const build = getById.data;

  useEffect(() => {
    if (paramId) {
      incrementView.mutate({
        build_id: paramId,
      });
    }
  }, [paramId]);

  useEffect(() => {
    if (paramId && user?.id) {
      setLiked(hasLiked(build?.likes, user?.id));
    }
  }, [paramId, build?.likes, user?.id]);

  if (!build) return null;

  const likeHandler = () => {
    likeBuild.mutate(
      {
        build_id: paramId,
      },
      {
        onSuccess: () => {
          setLiked(true);
        },
      }
    );
  };

  const dislikeHandler = () => {
    dislikeBuild.mutate(
      {
        build_id: paramId,
      },
      {
        onSuccess: () => {
          setLiked(false);
        },
      }
    );
  };

  const LikeButton = () =>
    liked ? (
      <Button variant="destructive" onClick={dislikeHandler}>
        <HeartOff size={20} className="mr-2" />{" "}
        <span className="font-bold">{build?.likes?.length}</span>
      </Button>
    ) : (
      <Button variant="ghost" onClick={likeHandler}>
        <Heart size={20} className="text-muted-foreground mr-2" />{" "}
        <span className="font-bold">{build?.likes?.length || 0}</span>
      </Button>
    );

  return (
    <section>
      <Header />

      {/* <section className="h-screen absolute inset-0 z-0 bg-stone-900 clip"></section> */}
      <section className="relative z-10 max-w-screen-xl w-full mx-auto my-20">
        <BuildHeader
          build={build}
          liked={liked ?? false}
          likeBtn={<LikeButton />}
          canEdit={build?.user_id === user?.id}
        />

        {build?.banner && (
          <div className="relative w-full h-[700px]  overflow-hidden shadow-xl">
            <Image
              src={build.banner.url}
              alt=""
              fill
              className="object-cover"
            />
          </div>
        )}
        <div className="flex gap-10 items-center mt-2">
          <Vehicle {...build.vehicle} />
        </div>
        <section>
          <div className="flex flex-col py-10">
            <p className="mb-8 max-w-3xl whitespace-pre-wrap leading-relaxed">
              {build?.description}
            </p>
            {user && (
              <div className="flex items-center  w-full max-w-xs  ">
                <div className="rounded-full relative">
                  <Avatar className="mr-2">
                    <AvatarImage src={user.imageUrl} />
                  </Avatar>
                </div>
                <p className="font-bold flex-1">{user.fullName}</p>
              </div>
            )}
          </div>
          <Separator className="my-10" />

          <div className="flex flex-col my-10">
            <H2 className="mb-6">The Gallery</H2>
            <Photos photos={build?.photos} />
          </div>

          <div className="flex flex-col my-10">
            <H2 className="mb-6">Modifications</H2>
            <Modifications modifications={build?.modifications} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col my-10">
              <H2 className="mb-6">Trips</H2>
              <Trips trips={build?.trips} />
            </div>

            <div className="flex flex-col my-10">
              <H2 className="mb-6">Links</H2>
              <Links links={build?.links} />
            </div>
          </div>
        </section>
      </section>
    </section>
  );
};

export default Build;
