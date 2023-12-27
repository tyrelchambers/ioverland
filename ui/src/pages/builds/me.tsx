import Header from "@/components/Header";
import { H1 } from "@/components/Heading";
import ImageWithFallback from "@/components/ImageWithFallback";
import { useBuilds } from "@/hooks/useBuilds";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import React from "react";

const Me = () => {
  const { user } = useUser();
  const { builds } = useBuilds(user?.id);

  return (
    <>
      <Header />
      <section className="max-w-screen-xl mx-auto my-20">
        <H1 className="mb-10">Viewing all my builds</H1>
        <ul className="grid grid-cols-3 gap-6">
          {builds.data?.map((build) => (
            <Link
              href={`/build/${build.uuid}`}
              key={build.uuid}
              className="builds-item"
            >
              <div>
                <header className="relative h-[240px] shadow-md">
                  <ImageWithFallback url={build.banner?.url} />
                </header>
                <p className="mt-3 font-bold text-xl font-serif text-foreground">
                  {build.name}
                </p>
                <p className="text-muted-foreground line-clamp-3 text-sm mt-1">
                  {build.description}
                </p>
              </div>
            </Link>
          ))}
        </ul>
      </section>
    </>
  );
};

export default Me;
