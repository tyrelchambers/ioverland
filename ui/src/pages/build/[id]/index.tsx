import { CommentInput, CommentList } from "@/components/Comments";
import Header from "@/components/Header";
import { H1, H2 } from "@/components/Heading";
import Info from "@/components/Info";
import VideoWithLoader from "@/components/VideoWithLoader";
import Links from "@/components/build/Links";
import Modifications from "@/components/build/Modifications";
import Photos from "@/components/build/Photos";
import Trips from "@/components/build/Trips";
import Vehicle from "@/components/build/Vehicle";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useBuild } from "@/hooks/useBuild";
import { useDomainUser } from "@/hooks/useDomainUser";
import { copyToClipboard, formatPrice, hasLiked } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";
import {
  Bookmark,
  BookmarkCheck,
  Copy,
  DollarSign,
  Eye,
  EyeOff,
  Facebook,
  Heart,
  HeartOff,
  PencilRuler,
  Share,
  Truck,
} from "lucide-react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

const Build = () => {
  const router = useRouter();
  const { user, isSignedIn } = useUser();
  const { user: domainUser, bookmark, removeBookmark } = useDomainUser();

  const paramId = router.query.id as string;
  const { getById, incrementView, likeBuild, dislikeBuild, buildComments } =
    useBuild(paramId);
  const [liked, setLiked] = useState<boolean | undefined>(undefined);

  const build = getById.data;
  const shareLink = `https://iover.land/build/${build?.uuid}`;

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
    } else {
      setLiked(false);
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
      <Button
        variant="destructive"
        onClick={dislikeHandler}
        disabled={!isSignedIn}
      >
        <HeartOff size={20} className="mr-2" />{" "}
        <span className="font-bold">{build?.likes?.length}</span>
      </Button>
    ) : (
      <Button variant="ghost" onClick={likeHandler} disabled={!isSignedIn}>
        <Heart size={20} className="text-muted-foreground mr-2" />{" "}
        <span className="font-bold">{build?.likes?.length || 0}</span>
      </Button>
    );

  if (!build.public && build.user_id !== user?.id) {
    return (
      <section>
        <Header />
        <section className="relative z-10 max-w-screen-xl w-full mx-auto my-10">
          <div className="flex flex-col items-center ">
            <EyeOff size={40} className="mb-8" />
            <H1 className="mb-2">This build has been made private</H1>
            <p className="text-muted-foreground">
              The owner of this build has made it private so it cannot be viewed
              by anyone.
            </p>
          </div>
        </section>
      </section>
    );
  }

  const copyToClipboardHandler = (text: string) => {
    copyToClipboard(text);
    toast.info("Copied to clipboard");
  };

  const twitterShareLink = `https://twitter.com/intent/tweet?text=Check%20out%20this%20build%20on%20iover.land&url=${shareLink}`;
  return (
    <section>
      <Head>
        <title>{build?.name} | iOverland</title>
      </Head>
      <Header />

      <section className="relative z-10 max-w-screen-xl w-full mx-auto my-10">
        {!build.public && (
          <div className="bg-warning p-4 rounded-md flex items-center gap-4 mb-10">
            <EyeOff />
            <p className="text-warning-foreground">
              This build is private. No one can see this.
            </p>
          </div>
        )}
        <header className="flex flex-col lg:items-start items-center my-6 lg:my-0 px-4">
          <span className="flex items-center text-muted-foreground gap-1 mb-4">
            {liked !== undefined && <LikeButton />}
          </span>
          <div className="flex justify-between items-center w-full flex-col lg:flex-row">
            <H1 className="lg:text-7xl font-serif font-light mb-8 text-center lg:text-left">
              {build?.name}
            </H1>

            <div className="flex items-center gap-2">
              <p className=" text-muted-foreground flex items-center">
                <Eye size={20} className="text-muted-foreground mr-2" />{" "}
                {build.views}
              </p>

              {isSignedIn && (
                <BookmarkButton
                  isBookmarked={
                    domainUser.data?.bookmarks.some(
                      (bookmark) => bookmark.id === build?.id
                    ) || false
                  }
                  bookmarkHandler={bookmarkHandler}
                  removeBookmarkHandler={removeBookmarkHandler}
                />
              )}

              <Dialog>
                <DialogTrigger asChild>
                  <Button size="icon" variant="ghost">
                    <Share size={20} className="text-muted-foreground" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl">
                  <DialogHeader>
                    <DialogTitle>Share</DialogTitle>
                  </DialogHeader>

                  <div
                    className="bg-card p-4 rounded-xl border border-border text-card-foreground flex justify-between items-center hover:cursor-pointer"
                    onClick={() => copyToClipboardHandler(shareLink)}
                  >
                    <p>{shareLink}</p>
                    <Copy size={18} />
                  </div>

                  <footer className="flex gap-4 items-center">
                    <a
                      href={twitterShareLink}
                      target="_blank"
                      className="w-10 h-10 rounded-full bg-card flex items-center justify-center"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        height="18"
                        width="18"
                        viewBox="0 0 512 512"
                      >
                        <path d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z" />
                      </svg>
                    </a>
                  </footer>
                </DialogContent>
              </Dialog>

              {build?.user_id === user?.id && (
                <Button size="sm" asChild>
                  <Link
                    href={`/build/${build?.uuid}/edit`}
                    className="text-green-foreground"
                  >
                    Edit build
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </header>

        {build.banner?.url && (
          <div className="px-4">
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
              <VideoWithLoader media={build.banner} autoPlay loop />
            )}
          </div>
        )}

        <section className="px-4 my-10">
          <div className="flex flex-col">
            {build.description && (
              <p className="my-8 max-w-3xl whitespace-pre-wrap leading-relaxed ">
                {build?.description}
              </p>
            )}

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

            <div className="flex flex-col lg:flex-row mt-10 gap-4">
              <Alert className="max-w-sm w-full">
                <Truck className="h-4 w-4" />
                <AlertTitle>Vehicle</AlertTitle>
                <AlertDescription>
                  <Vehicle {...build.vehicle} />
                </AlertDescription>
              </Alert>

              <Alert className="max-w-sm w-full">
                <DollarSign className="h-4 w-4" />
                <AlertTitle>Budget</AlertTitle>
                <AlertDescription>
                  {Number(build.budget) ? (
                    <p>{formatPrice(Number(build.budget))}</p>
                  ) : null}
                </AlertDescription>
              </Alert>
            </div>
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="flex flex-col my-10">
              <H2 className="mb-6">Trips</H2>
              <Trips trips={build?.trips} />
            </div>

            <div className="flex flex-col my-10">
              <H2 className="mb-6">Links</H2>
              <Links links={build?.links} />
            </div>
          </div>
          <Separator />

          <section className="my-10 lg:w-1/2 w-full">
            <H2 className="mb-8">Comments</H2>
            {isSignedIn ? (
              <CommentInput buildId={build?.uuid} />
            ) : (
              <Info>
                <p>Sign in to comment</p>
              </Info>
            )}
            <Separator className="mt-6" />
            {buildComments.data && (
              <CommentList comments={buildComments.data} />
            )}
          </section>
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
    <Button variant="outline" onClick={removeBookmarkHandler}>
      <BookmarkCheck size={18} className="mr-2" />
      Bookmarked
    </Button>
  ) : (
    <Button size="icon" variant="ghost" onClick={bookmarkHandler}>
      <Bookmark size={18} className="text-muted-foreground" />
    </Button>
  );

export default Build;
