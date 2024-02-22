import BuildItem from "@/components/BuildItem";
import Header from "@/components/Header";
import { H1 } from "@/components/Heading";
import Large from "@/components/explore/Large";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useExplore } from "@/hooks/useExplore";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const Explore = () => {
  const { explore } = useExplore();
  const GOAL = 20;

  const allBuilds = explore.data?.builds;
  const truckBuilds =
    explore.data?.builds?.filter((b) => b.vehicle.type === "Truck") || [];

  return (
    <div className="relative min-h-screen  overflow-x-hidden">
      <Head>
        <title>Explore | WildBarrens</title>
      </Head>
      <Header />

      <div className="h-[400px] max-w-screen-2xl mx-auto my-10 rounded-lg overflow-hidden relative flex">
        <div className="absolute inset-0 p-10 z-10 flex flex-col items-center justify-center gap-4">
          <H1 className="text-white">Find the next best Overland build</H1>
          <p className="max-w-3xl text-white/80 text-xl text-center">
            Browse all of the builds on WildBarrens and who knows, maybe
            you&apos;ll find your next big idea
          </p>

          <div className="flex mt-6">
            <Link href="/sign-up">
              <Button>Sign up and create your first build</Button>
            </Link>
          </div>
        </div>

        <div className="w-full h-full relative">
          <Image
            src="/bradley-dunn-EiIxw5sZiDQ-unsplash 2.jpg"
            fill
            alt=""
            objectFit="cover"
            objectPosition="bottom"
          />
          <div className="bg-black/40 absolute inset-0"></div>
        </div>
      </div>

      <section className="w-full max-w-screen-2xl mx-auto">
        <header>
          <Tabs defaultValue="all">
            <TabsList className="bg-card rounded-md">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="car">Cars</TabsTrigger>
              <TabsTrigger value="truck">Trucks</TabsTrigger>
              <TabsTrigger value="van">Vans</TabsTrigger>
              <TabsTrigger value="suv">SUVs</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-10">
              <div className="grid grid-cols-5 gap-4">
                {allBuilds?.map((b) => (
                  <BuildItem build={b} key={b.uuid} showDescription={false} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="truck" className="mt-10">
              <div className="grid grid-cols-5 gap-4">
                {truckBuilds.map((b) => (
                  <BuildItem build={b} key={b.uuid} showDescription={false} />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </header>
      </section>
    </div>
  );
};

export default Explore;
