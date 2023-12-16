import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useBuild } from "@/hooks/useBuild";
import { cn } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";
import { MessageSquare } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";

const Build = () => {
  const router = useRouter();
  const { user } = useUser();
  const paramId = router.query.id as string;
  const { getById } = useBuild(paramId);

  const build = getById.data;
  return (
    <section>
      <section className="max-w-screen-xl mx-auto my-20">
        {build?.banner && (
          <div className="relative w-full h-[700px] rounded-xl overflow-hidden">
            <Image src={build.banner} alt="" fill className="object-cover" />
          </div>
        )}

        <section className="my-20">
          <header className="h-[400px] flex flex-col items-center justify-center">
            {user && (
              <div className="flex items-center bg-card p-2 rounded-full max-w-xs w-full mb-10">
                <div className="rounded-full relative">
                  <Avatar className="mr-2">
                    <AvatarImage src={user.imageUrl} />
                    <AvatarFallback>
                      {user.fullName?.slice(0, 1)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <p className="font-bold flex-1">{user.fullName}</p>
                <div className="flex">
                  <Button size="icon" className="rounded-full">
                    <MessageSquare size={16} />
                  </Button>
                </div>
              </div>
            )}
            <h1 className="text-6xl font-serif">{build?.name}</h1>
            <p className="mt-4 pb-20 max-w-3xl">{build?.description}</p>
            {build?.user_id === user?.id && (
              <Link href={`/build/${build?.uuid}/edit`}>
                <Button variant="secondary">Edit</Button>
              </Link>
            )}
          </header>

          <div className="flex flex-col my-20 gap-8">
            {build?.photos?.map((photo, i) => (
              <div
                key={photo}
                className={cn(
                  "relative max-w-3xl w-full aspect-video rounded-xl overflow-hidden shadow-xl  bg-card",
                  i % 2 ? "ml-auto" : "mr-auto"
                )}
              >
                <Image src={photo} alt="" fill className="object-contain" />
              </div>
            ))}
          </div>

          <div></div>
        </section>
      </section>
    </section>
  );
};

export default Build;
