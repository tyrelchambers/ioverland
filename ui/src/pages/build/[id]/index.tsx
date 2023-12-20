import Header from "@/components/Header";
import { H1, H2 } from "@/components/Heading";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useBuild } from "@/hooks/useBuild";
import {
  cn,
  findCategory,
  groupModificationsByCategory,
  hasLiked,
} from "@/lib/utils";
import { useUser } from "@clerk/nextjs";
import {
  ExternalLink,
  Eye,
  Flag,
  Heart,
  HeartOff,
  PencilRuler,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

const Build = () => {
  const router = useRouter();
  const { user } = useUser();
  const paramId = router.query.id as string;
  const { getById, incrementView, likeBuild, dislikeBuild } = useBuild(paramId);
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
    if (paramId && build?.likes && user?.id) {
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
        <span className="flex items-center text-muted-foreground gap-1 mb-4">
          {liked !== undefined && <LikeButton />}
        </span>
        <div className="flex justify-between items-center w-full">
          <H1 className="text-7xl font-serif font-light mb-8">{build?.name}</H1>

          <div className="flex items-center ">
            <p className=" text-muted-foreground mr-4 flex items-center">
              <Eye size={20} className="text-muted-foreground mr-2" />{" "}
              {build.views}
            </p>

            <Button variant="ghost" size="icon" asChild>
              <Link href="#">
                <Flag size={20} className="text-muted-foreground" />
              </Link>
            </Button>

            {build?.user_id === user?.id && (
              <Button size="sm" asChild>
                <Link
                  href={`/build/${build?.uuid}/edit`}
                  className="text-green-foreground"
                >
                  <PencilRuler size={18} className="mr-2" />
                  Edit
                </Link>
              </Button>
            )}
          </div>
        </div>

        {build?.banner && (
          <div className="relative w-full h-[700px] rounded-xl overflow-hidden shadow-xl">
            <Image
              src={build.banner.url}
              alt=""
              fill
              className="object-cover"
            />
          </div>
        )}
        <div className="flex gap-10 items-center mt-2">
          <p className="flex gap-2 capitalize">
            <span className="text-foreground font-bold">
              {build?.vehicle.make}
            </span>{" "}
            <span className="text-muted-foreground">
              {build?.vehicle.model}
            </span>{" "}
            <span className="text-muted-foreground font-light">
              {build?.vehicle.year}
            </span>
          </p>
        </div>
        <section>
          <div className="min-h-[400px] flex flex-col py-10">
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
                <div className="flex ml-8">
                  <Button variant="secondary" title="Message">
                    Contact
                  </Button>
                </div>
              </div>
            )}
          </div>
          <Separator className="my-10" />

          <div className="flex flex-col my-10">
            <H2 className="mb-6">The Gallery</H2>
            <div className="grid grid-cols-2 gap-8">
              {build?.photos?.map((photo, i) => (
                <div
                  key={photo.uuid}
                  className={cn(
                    "relative  w-full aspect-square rounded-xl overflow-hidden shadow-xl ",
                    i % 2 && "mt-[100px]"
                  )}
                >
                  <Image src={photo.url} alt="" fill className="object-cover" />
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col my-10">
            <H2 className="mb-6">Modifications</H2>
            {build?.modifications && (
              <div className="grid grid-cols-3 gap-6">
                {Object.entries(
                  groupModificationsByCategory(build.modifications)
                ).map(([i, mod]) => {
                  const category = findCategory(i);
                  return (
                    <div
                      key={i}
                      className="border-border border rounded-xl p-4"
                    >
                      <p className="font-serif text-xl mb-6">
                        {category?.label}
                      </p>
                      <ul className="flex flex-col  gap-4">
                        {mod.map((mod) => (
                          <li
                            key={mod.id}
                            className="flex justify-between odd:bg-muted p-2 px-4 rounded-md"
                          >
                            <p className="text-muted-foreground font-bold">
                              {mod.name}
                            </p>
                            <p className="text-muted-foreground">
                              ${mod.price}
                            </p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col my-10">
              <H2 className="mb-6">Trips</H2>
              <div className="flex flex-col gap-3">
                {build?.trips &&
                  build.trips.map((trip) => (
                    <div
                      key={trip.uuid}
                      className="border border-border rounded-xl p-3 flex justify-between items-start"
                    >
                      <p className="font-bold">{trip.name}</p>
                      <p>{trip.year}</p>
                    </div>
                  ))}
              </div>
            </div>

            {/* find out why modifications are not saving during edit */}

            <div className="flex flex-col my-10">
              <H2 className="mb-6">Links</H2>
              <div className="flex flex-col gap-3">
                {build?.links &&
                  build.links.map((link, id) => (
                    <a
                      href={link}
                      key={link + "_" + id}
                      className="border border-border rounded-xl p-3 flex gap-3 items-center hover:underline hover:text-blue-400"
                      target="_blank"
                    >
                      <ExternalLink size={16} />
                      <p className="truncate">{link}</p>
                    </a>
                  ))}
              </div>
            </div>
          </div>
        </section>
      </section>
    </section>
  );
};

export default Build;
