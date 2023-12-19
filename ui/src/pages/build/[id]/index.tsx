import Header from "@/components/Header";
import { H1, H2 } from "@/components/Heading";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useBuild } from "@/hooks/useBuild";
import {
  cn,
  findCategory,
  findCategorySubcategories,
  findSubcategory,
  groupModificationsByCategory,
} from "@/lib/utils";
import { useUser } from "@clerk/nextjs";
import { Eye, Flag, Heart, PencilRuler } from "lucide-react";
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
      <Header />

      {/* <section className="h-screen absolute inset-0 z-0 bg-stone-900 clip"></section> */}
      <section className="relative z-10 max-w-screen-xl w-full mx-auto my-20">
        <span className="flex items-center text-muted-foreground gap-1 mb-4">
          <Heart />
          <span className="font-bold">20</span> likes
        </span>
        <div className="flex justify-between items-center w-full">
          <H1 className="text-7xl font-serif font-light mb-8">{build?.name}</H1>

          <div className="flex items-center ">
            <p className=" text-muted-foreground mr-4 flex items-center">
              <Eye size={20} className="text-muted-foreground mr-2" /> 123
            </p>

            {build?.user_id === user?.id && (
              <Button variant="ghost" size="icon" asChild>
                <Link href={`/build/${build?.uuid}/edit`}>
                  <PencilRuler size={20} className="text-green-500" />
                </Link>
              </Button>
            )}

            <Button variant="ghost" size="icon" asChild>
              <Link href="#">
                <Flag size={20} className="text-muted-foreground" />
              </Link>
            </Button>
            <Button variant="ghost" size="icon">
              <Heart size={20} className="text-muted-foreground" />
            </Button>
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
                {Object.values(
                  groupModificationsByCategory(build.modifications)
                ).map((mod, i) => (
                  <div
                    key={mod[i].category}
                    className="border-border border rounded-xl p-4"
                  >
                    <p className="font-serif text-xl mb-6">
                      {findCategory(mod[i].category)?.label}
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
                          <p className="text-muted-foreground">${mod.price}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </section>
    </section>
  );
};

export default Build;
