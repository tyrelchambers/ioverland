import Header from "@/components/Header";
import { H2 } from "@/components/Heading";
import { Button } from "@/components/ui/button";
import { useAuth } from "@clerk/nextjs";
import {
  Bookmark,
  Heart,
  Lightbulb,
  MapPin,
  MessageSquare,
  Trophy,
  Users,
  Video,
  Wrench,
} from "lucide-react";
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
            <div className="flex items-center mt-10 gap-6 flex-col md:flex-row">
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
          <div className="relative w-full lg:h-[600px] h-[400px]">
            <Image
              src="/car in forest.jpg"
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

      <section className="max-w-screen-xl w-full flex flex-col lg:flex-row mx-auto mb-20 lg:mb-40 p-6">
        <div className="lg:h-[600px] lg:w-[600px] w-full h-[400px]  relative overflow-hidden rounded-xl shadow-xl mb-10 lg:mb-0">
          <Image src="/car by water.jpg" alt="" fill className="object-cover" />
        </div>
        <div className="flex-1 flex flex-col px-4">
          <header className="max-w-2xl w-full">
            <H2 className="mb-5 text-4xl">Features</H2>
            <p className="text-muted-foreground">
              iOverland is designed and will continue to be improved upon, to
              provide you with a fun and easy way to showcase your overland
              builds. We want you to show-off what you&apos;ve built and be able
              to connect with other like-minded creators.
            </p>
          </header>

          <div className="grid lg:grid-cols-1 grid-cols-1 mt-12 gap-10">
            <div className="flex gap-6">
              <Bookmark className="text-primary mt-1" size={30} />
              <div className="flex flex-col">
                <p className=" font-bold  text-xl">Bookmarks</p>
                <p className="text-muted-foreground">
                  Find a build you like and bookmark it
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <Heart className="text-primary mt-1" size={30} />
              <div className="flex flex-col">
                <p className=" font-bold  text-xl">Likes</p>
                <p className="text-muted-foreground">
                  Show your support and love with likes
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <Trophy className="text-primary mt-1" size={30} />
              <div className="flex flex-col">
                <p className=" font-bold  text-xl">Featured</p>
                <p className="text-muted-foreground">
                  Have a chance to be featured on iOverland
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="relative">
        <Image
          src="/topographical.jpg"
          fill
          alt=""
          className="object-cover opacity-10"
        />
        <section className="max-w-screen-xl w-full mx-auto lg:mb-40 py-20 relative p-6">
          <header className="max-w-2xl w-full">
            <H2 className="mb-5 text-4xl">Roadmap</H2>
            <p className="text-muted-foreground">
              We&apos;d love to share with you our roadmap of where we would
              like to take things in the near future. Please keep in mind these
              items are technically, subject to change, however it is incredibly
              unlikely as we have a goal that without these features, would not
              quite be achieved.
            </p>
          </header>

          <div className="grid lg:grid-cols-3 grid-cols-1 mt-12 gap-10">
            <div>
              <MapPin className="text-primary" size={30} />
              <p className=" font-bold my-2 text-xl">Trips</p>
              <p className="text-muted-foreground">
                Detail your Overlanding trips
              </p>
            </div>

            <div>
              <MessageSquare className="text-primary" size={30} />
              <p className=" font-bold my-2 text-xl">Comment</p>
              <p className="text-muted-foreground">
                Leave comments and let others known what you think of their
                build
              </p>
            </div>

            <div>
              <Users className="text-primary" size={30} />
              <p className=" font-bold my-2 text-xl">Meetups</p>
              <p className="text-muted-foreground">
                Meet up with other iOverlanders
              </p>
            </div>
          </div>
        </section>
      </section>

      <section className="my-20 max-w-screen-xl mx-auto">
        <div className="flex items-center flex-col-reverse lg:flex-row p-4 lg:p-0">
          <div className="flex flex-col lg:p-20 p-6">
            <H2 className="lg:text-6xl text-4xl mb-10">
              We would love to see your build
            </H2>
            <p className="text-muted-foreground max-w-3xl text-xl leading-relaxed">
              Overlanding is an ever-growing recreational activity and we all
              need a place where we can show off the love and care we have put
              into our Overland builds. We would love to see your build on
              iOverland so it can be appreciated in all it&apos;s glory!
            </p>
            <Link href="/sign-up" className="mt-10">
              <Button type="button" size="lg">
                Sign up
              </Button>
            </Link>
          </div>
          <div className="lg:h-[600px] lg:w-[700px] w-full h-[400px] relative overflow-hidden rounded-xl shadow-xl">
            <Image
              src="/group car 1.jpg"
              alt=""
              fill
              className="scale-105 object-cover"
            />
          </div>
        </div>
      </section>
    </main>
  );
}
