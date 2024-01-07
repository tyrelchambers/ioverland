import BuildItem from "@/components/BuildItem";
import Header from "@/components/Header";
import { H1, H2 } from "@/components/Heading";
import Featured from "@/components/explore/Featured";
import Top10 from "@/components/explore/Top10";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useExplore } from "@/hooks/useExplore";
import { Feather } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const Explore = () => {
  const { explore } = useExplore();
  const GOAL = 20;

  return (
    <div className="relative min-h-screen">
      <Header />

      {/* <Featured featured={explore.data?.featured} />
      <Top10 top10={explore.data?.top_10} /> */}

      <div className="w-1/2 -rotate-45 top-[150px] left-[-150px] opacity-20 absolute hidden lg:block">
        <Image src="/lines.png" alt="lines" height={600} width={1920} />
      </div>

      <div className="w-1/2 rotate-45 top-[150px] -right-[150px] opacity-20 absolute hidden lg:block">
        <Image src="/lines.png" alt="lines" height={600} width={1920} />
      </div>

      <div className="max-w-3xl flex flex-col items-center mx-auto my-10 p-10 absolute z-10 inset-0 top-10">
        <H1 className="my-10 text-6xl text-center">
          You&apos;ve made it to the explore page!
        </H1>
        <p className="text-muted-foreground text-center">
          iOverland is a very new project and evidently we don&apos;t have much
          to show here, yet. We would absolutely love it if you&apos;d help us
          by creating your own overlanding build so we can add it to this list!{" "}
        </p>
        <Link href="/build/new" className="mt-10">
          <Button size="lg">Create a build</Button>
        </Link>

        <div className="p-10 border border-border  rounded-xl w-full mt-10 shadow-md">
          <header className="flex justify-between">
            <p className=" mb-4 font-bold text-muted-foreground">
              {explore.data?.build_count ?? 0} / {GOAL} Builds
            </p>
            <p className=" mb-4 font-bold text-muted-foreground">
              {explore.data?.goal_remaining ?? 0} remaining
            </p>
          </header>
          {explore.data?.build_count !== undefined && (
            <Progress value={(explore.data?.build_count / GOAL) * 100} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Explore;
