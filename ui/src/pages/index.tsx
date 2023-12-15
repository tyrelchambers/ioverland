import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut, UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";

export default function Home() {
  const { isSignedIn, isLoaded } = useUser();

  return (
    <main>
      <header className="fixed inset-4 z-10 text-white flex justify-between h-fit">
        <h2>iOverland</h2>
        <div className="flex gap-4 items-center">
          <Link
            href={`/builds/me`}
            className="text-foreground hover:text-foreground/70"
          >
            My builds
          </Link>
          <SignedIn>
            <Link href="/build/new">
              <Button>New build</Button>
            </Link>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
          <SignedOut>
            <Button>Sign up</Button>
          </SignedOut>
        </div>
      </header>
      <section className="h-screen bg-slate-100 clip flex items-center justify-center relative">
        <div className="max-w-screen-xl absolute inset-0 z-10 top-1/2 translate-y-[-50%] mx-auto">
          <h1 className="font-serif text-8xl mb-6 text-white">
            More than Overland
          </h1>
          <p className="text-3xl text-white max-w-2xl leading-relaxed">
            Showcase your overlanding builds. But it doesn&apos;t stop there.
            Show everyone your offroad builds from trucks, to SxS and ATVs.
          </p>
        </div>
        <div className="absolute inset-0">
          <div className="bg-black opacity-20 absolute inset-0"></div>
          <video
            src="./177490_Offroad jeep driving over rocky ground aerial _By_Timelab_Pro_Artlist_HD.mp4"
            autoPlay
            muted
            loop
          ></video>
        </div>
      </section>
      <section className="h-screen"></section>

      <section className="h-screen bg-slate-100 clip-rev"></section>
    </main>
  );
}
