import Header from "@/components/Header";
import { H2 } from "@/components/Heading";
import { Button } from "@/components/ui/button";
import { useAuth } from "@clerk/nextjs";
import { Lightbulb, Video, Wrench } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  const { isSignedIn } = useAuth();
  return (
    <main>
      <section className="h-screen flex relative">
        <div className="w-full flex flex-col items-center absolute inset-0 z-10 justify-center max-w-screen-xl h-full min-h-screen mx-auto">
          <Header className="absolute top-0 bg-transparent border-0 w-full" />
          <div className="flex flex-col p-4 w-full items-center">
            {" "}
            <h1 className="font-serif lg:text-8xl text-4xl mb-10 font-bold text-foreground text-center">
              More than Overland
            </h1>
            <p className="lg:text-2xl text-muted-foreground font-light max-w-2xl leading-relaxed text-center text-pretty">
              Showcase your overlanding builds. But it doesn&apos;t stop there.
              Show everyone your offroad builds from trucks, to SxS and ATVs.
            </p>
            <div className="flex items-center mt-10 gap-6 flex-col lg:flex-row">
              <Link href={isSignedIn ? "/build/new" : "/sign-up"}>
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

      <section className="max-w-screen-xl mx-auto  lg:-translate-y-40">
        <div className="my-10 rounded-md shadow-xl overflow-hidden mx-4">
          <div className="relative w-full lg:h-[600px] h-[200px] ">
            <Image
              src="/tease 2.jpg"
              alt=""
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>

        <div className="flex flex-col items-center w-full py-20">
          <H2 className="lg:!text-6xl text-center">Show off your vehicle</H2>
          <p className="lg:text-2xl text-muted-foreground font-light max-w-2xl leading-relaxed text-center mt-4">
            Upload images and videos of your Overlanding build to showcase to
            the world.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mt-20">
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
    </main>
  );
}
