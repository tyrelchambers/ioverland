import Header from "@/components/Header";
import { H1, H2 } from "@/components/Heading";
import Links from "@/components/build/Links";
import Modifications from "@/components/build/Modifications";
import Photos from "@/components/build/Photos";
import Trips from "@/components/build/Trips";
import Vehicle from "@/components/build/Vehicle";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useBuild } from "@/hooks/useBuild";
import { useDomainUser } from "@/hooks/useDomainUser";
import { hasLiked } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";
import {
  Bookmark,
  BookmarkCheck,
  BookmarkMinus,
  Eye,
  Heart,
  HeartOff,
  PencilRuler,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

const Build = () => {
  const router = useRouter();
  const { user } = useUser();
  const { user: domainUser, bookmark, removeBookmark } = useDomainUser();

  const paramId = router.query.id as string;
  const {
    getById: { data: build },
    incrementView,
    likeBuild,
    dislikeBuild,
  } = useBuild(paramId);
  const [liked, setLiked] = useState<boolean | undefined>(undefined);

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

  const bookmarkHandler = () => {
    bookmark.mutate(
      {
        build_id: paramId,
      },
      {
        onSuccess: () => {
          toast.success("Build bookmarked");
        },
      }
    );
  };

  const removeBookmarkHandler = () => {
    removeBookmark.mutate(
      {
        build_id: paramId,
      },
      {
        onSuccess: () => {
          toast.success("Build removed from bookmarks");
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

      <section className="relative z-10 max-w-screen-xl w-full mx-auto my-20">
        <header className="flex flex-col">
          <span className="flex items-center text-muted-foreground gap-1 mb-4">
            {liked !== undefined && <LikeButton />}
          </span>
          <div className="flex justify-between items-center w-full">
            <H1 className="text-7xl font-serif font-light mb-8">
              {build?.name}
            </H1>

            <div className="flex items-center gap-3">
              <p className=" text-muted-foreground flex items-center">
                <Eye size={20} className="text-muted-foreground mr-2" />{" "}
                {build.views}
              </p>

              <BookmarkButton
                isBookmarked={
                  domainUser.data?.bookmarks.some(
                    (bookmark) => bookmark.id === build?.id
                  ) || false
                }
                bookmarkHandler={bookmarkHandler}
                removeBookmarkHandler={removeBookmarkHandler}
              />

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
        </header>

        {build.banner && (
          <>
            {build.banner.mime_type.includes("image") ? (
              <div className="relative w-full h-[700px]  overflow-hidden shadow-xl">
                <Image
                  src={build.banner.url}
                  alt=""
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <video autoPlay muted loop>
                <source src={build.banner.url} type={build.banner.mime_type} />
              </video>
            )}
          </>
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

const BookmarkButton = ({
  isBookmarked,
  bookmarkHandler,
  removeBookmarkHandler,
}: {
  isBookmarked: boolean;
  bookmarkHandler: () => void;
  removeBookmarkHandler: () => void;
}) =>
  isBookmarked ? (
    <Button variant="default" onClick={removeBookmarkHandler}>
      <BookmarkCheck size={18} className="text-white mr-2" />
      Bookmarked
    </Button>
  ) : (
    <Button variant="ghost" onClick={bookmarkHandler}>
      <Bookmark size={18} className="text-muted-foreground" />
    </Button>
  );

export default Build;
