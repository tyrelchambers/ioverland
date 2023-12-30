import BuildItem from "@/components/BuildItem";
import Header from "@/components/Header";
import { H1, H2 } from "@/components/Heading";
import RenderMedia from "@/components/RenderMedia";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useExplore } from "@/hooks/useExplore";
import Link from "next/link";
import React from "react";

const Explore = () => {
  const { explore } = useExplore();
  return (
    <div>
      <Header />

      <div className="max-w-screen-xl mx-auto my-10">
        <H1>Find inspiration for your next build.</H1>
        <Carousel
          className="mt-6"
          opts={{
            loop: true,
          }}
        >
          <CarouselContent>
            {explore.data?.featured?.map((build, index) => (
              <CarouselItem key={build.id + "_" + index}>
                <Link href={`/build/${build.uuid}`}>
                  <div className="relative">
                    <header className="relative h-[600px] shadow-md">
                      {build.banner && (
                        <RenderMedia
                          media={build.banner}
                          autoPlay
                          showVideo
                          loop
                        />
                      )}
                    </header>
                    <div className="absolute bottom-0 left-0 right-0 backdrop-blur-md bg-white/10 p-6">
                      <p className="mt-3 font-bold text-xl font-serif text-background">
                        {build.name}
                      </p>
                    </div>
                  </div>
                </Link>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
      <section className="bg-card w-full">
        <div className="max-w-screen-xl mx-auto my-10 p-10">
          <H2>Top 10 Builds</H2>

          <div className="grid grid-cols-2 gap-6 mt-12">
            {explore.data?.top_10?.map((build, index) => (
              <BuildItem
                build={build}
                key={build.uuid + "_" + index}
                showVideo
                playVideo
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Explore;
