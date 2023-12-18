import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default function Home() {
  return (
    <main>
      <Header on="dark" />
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
