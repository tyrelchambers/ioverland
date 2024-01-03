import Header from "@/components/Header";
import { H1, H2 } from "@/components/Heading";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SignedIn, SignedOut } from "@clerk/clerk-react";
import { UserButton } from "@clerk/nextjs";
import { Bookmark, Lightbulb, Video, Wrench } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main>
      <section className="h-screen flex relative">
        <div className="w-full flex flex-col items-center absolute inset-0 z-10 justify-center max-w-screen-xl h-screen mx-auto">
          <header className="header absolute top-0 p-4 transition-all flex items-center z-50 w-full">
            <h2 className="text-foreground font-bold font-serif">iOverland</h2>
            <div className="flex gap-4 items-center ">
              <SignedIn>
                <Link href={`/explore`}>
                  <Button variant="link">Explore</Button>
                </Link>
                <Link href={`/dashboard`}>
                  <Button variant="link">Dashboard</Button>
                </Link>
                <Link href="/build/new">
                  <Button
                    size="sm"
                    className={cn("text-primary-foreground bg-primary")}
                  >
                    New build
                  </Button>
                </Link>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
              <SignedOut>
                <Link href="/sign-up">
                  <Button>Sign up</Button>
                </Link>
              </SignedOut>
            </div>
          </header>
          <h1 className="font-serif text-8xl mb-10 font-bold text-foreground text-center">
            More than Overland
          </h1>
          <p className="text-2xl text-muted-foreground font-light max-w-2xl leading-relaxed text-center">
            Showcase your overlanding builds. But it doesn&apos;t stop there.
            Show everyone your offroad builds from trucks, to SxS and ATVs.
          </p>

          <div className="flex items-center mt-10 gap-6">
            <Link href="/sign-up">
              <Button type="button" className="w-full">
                Create your build
              </Button>
            </Link>

            <Link href="/explore">
              <Button type="button" variant="outline">
                Find your inspiration
              </Button>
            </Link>
          </div>
        </div>

        <div className="w-full bg-gray-100 relative opacity-10">
          <Image
            src="/topographical.jpg"
            fill
            alt=""
            className="object-cover"
          />
        </div>
      </section>

      <section className="max-w-screen-xl mx-auto  -translate-y-40">
        <div className="my-10 rounded-md shadow-xl overflow-hidden">
          <div className="relative w-full h-[600px]">
            <Image src="/tease 2.jpg" alt="" fill className="object-cover" />
          </div>
        </div>

        <div className="flex flex-col items-center w-full py-20">
          <H2 className="!text-6xl">Show off your vehicle</H2>
          <p className="text-2xl text-muted-foreground font-light max-w-2xl leading-relaxed text-center mt-4">
            Upload images and videos of your Overlanding build to showcase to
            the world.
          </p>

          <div className="grid grid-cols-3 gap-10 mt-20">
            <div className="flex flex-col items-center text-muted-foreground gap-6">
              <Video size={30} />
              <h3>Upload videos and images</h3>
            </div>
            <div className="flex flex-col items-center text-muted-foreground gap-6">
              <Wrench size={30} />
              <h3>Detail your modifications</h3>
            </div>
            <div className="flex flex-col items-center text-muted-foreground gap-6">
              <Lightbulb size={30} />
              <h3>Become someone&apos;s inspiration</h3>
            </div>
          </div>
        </div>
      </section>

      <section className="relative">
        <div className="relative h-screen">
          <Image
            src="/topo2.jpg"
            fill
            alt=""
            className="object-cover opacity-10"
          />
        </div>

        <div className="flex flex-col items-center w-full py-20 absolute inset-0 max-w-screen-lg mx-auto">
          <H2 className="!text-6xl mb-20">Become an inspiration</H2>

          <div className="w-1/2 h-[300px] mr-auto flex flex-col justify-center items-center gap-4 bg-background my-10 p-8 rounded-md shadow-lg text-muted-foreground">
            <Lightbulb size={40} />
            <h3 className="text-xl text-center">
              Through likes &amp; views, become discoverable
            </h3>
          </div>

          <div className="w-1/2 h-[300px] ml-auto flex flex-col justify-center items-center gap-4 bg-background my-10 p-8 rounded-md shadow-lg text-muted-foreground">
            <Bookmark size={40} />
            <h3 className="text-xl text-center">
              Bookmark your favourite builds for later
            </h3>
          </div>
        </div>
      </section>
    </main>
  );
}
