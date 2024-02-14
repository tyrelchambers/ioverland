import Header from "@/components/Header";
import { H1 } from "@/components/Heading";
import Photos from "@/components/build/Photos";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAdventure } from "@/hooks/useAdventure";
import { useDomainUser } from "@/hooks/useDomainUser";
import { hasLiked } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";
import { Calendar, Eye, Heart, HeartOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

const Adventure = () => {
  const router = useRouter();
  const advId = router.query.id as string;
  const { isSignedIn } = useUser();
  const { user } = useDomainUser();
  const { adventureById, like, dislike } = useAdventure({
    adventureId: advId,
  });
  const [liked, setLiked] = useState<boolean | undefined>(undefined);

  const adv = adventureById.data;

  useEffect(() => {
    if (advId && user.data?.uuid) {
      setLiked(
        hasLiked(
          adv?.likes.map((l) => l.uuid),
          user.data?.uuid
        )
      );
    } else {
      setLiked(false);
    }
  }, [advId, adv?.likes, user.data?.uuid]);

  const likeHandler = () => {
    like.mutate(
      {
        adv_id: advId,
      },
      {
        onSuccess: () => {
          setLiked(true);
        },
      }
    );
  };

  const dislikeHandler = () => {
    dislike.mutate(
      {
        adv_id: advId,
      },
      {
        onSuccess: () => {
          setLiked(false);
        },
      }
    );
  };

  if (!adv) return null;

  const LikeButton = () =>
    liked ? (
      <Button
        variant="destructive"
        onClick={dislikeHandler}
        disabled={!isSignedIn}
      >
        <HeartOff size={20} className="mr-2" />{" "}
        <span className="font-bold">{adv?.likes?.length}</span>
      </Button>
    ) : (
      <Button variant="ghost" disabled={!isSignedIn} onClick={likeHandler}>
        <Heart size={20} className="text-muted-foreground mr-2" />{" "}
        <span className="font-bold">{adv?.likes?.length || 0}</span>
      </Button>
    );

  return (
    <>
      <Header />
      <div className="my-10 max-w-screen-xl mx-auto px-4">
        <header className="max-w-4xl ">
          <div className="flex items-center mb-4">
            {user.data?.uuid === adv.user.uuid && (
              <Link href={`/adventure/${adv.uuid}/edit`}>
                <Button size="sm">Edit</Button>
              </Link>
            )}
            <LikeButton />
            <span className="flex items-center font-bold text-sm">
              <Eye size={20} className="text-muted-foreground mr-2" />
              {adv.views}
            </span>
          </div>
          <H1 className="mb-6">{adv.name}</H1>
          <p className="whitespace-pre-wrap text-muted-foreground leading-8">
            {adv.summary}
          </p>
          <section className="my-6">
            <Alert className="max-w-sm w-full">
              <Calendar className="h-4 w-4" />
              <AlertTitle>Year</AlertTitle>
              <AlertDescription>
                <p>{adv.year}</p>
              </AlertDescription>
            </Alert>
          </section>
          <div className="flex items-center  w-full max-w-xs  mt-10">
            <div className="rounded-full relative">
              <Avatar className="mr-2">
                <AvatarImage src={adv.user.image_url} />
              </Avatar>
            </div>
            <p className="font-bold flex-1">{adv.user.username}</p>
          </div>
        </header>

        <section className="my-20 p-4 lg:p-0">
          <Photos cols={4} photos={adv.photos} />
        </section>
      </div>
    </>
  );
};

export default Adventure;
