import React from "react";
import { H1 } from "../Heading";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../ui/carousel";
import RenderMedia from "../RenderMedia";
import { Build } from "@/types";
import { useViewportWidth } from "@/hooks/useViewportWidth";
import Link from "next/link";

const Featured = ({ featured }: { featured: Build[] | undefined }) => {
  const { width } = useViewportWidth();

  return (
    <div className="max-w-screen-xl mx-auto my-10">
      <H1>Find inspiration for your next build.</H1>
      <Carousel
        className="mt-6 lg:mx-4"
        opts={{
          loop: true,
        }}
      >
        <CarouselContent>
          {featured?.map((build, index) => (
            <CarouselItem key={build.id + "_" + index}>
              <Link href={`/build/${build.uuid}`}>
                <div className="relative">
                  <header className="relative h-[200px] lg:h-[600px] shadow-md">
                    {build.banner && (
                      <RenderMedia media={build.banner} autoPlay loop />
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
        {width > 768 && (
          <>
            <CarouselPrevious />
            <CarouselNext />
          </>
        )}
      </Carousel>
    </div>
  );
};

export default Featured;
