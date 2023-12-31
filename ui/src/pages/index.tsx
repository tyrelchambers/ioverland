import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main>
      <Header on="dark" />
      <section className="h-[calc(100vh-64px)] flex">
        <div className="w-1/2 p-20 flex flex-col justify-center">
          <h1 className="font-serif text-8xl mb-10 font-bold text-foreground">
            More than Overland
          </h1>
          <p className="text-2xl text-muted-foreground font-light max-w-2xl leading-relaxed">
            Showcase your overlanding builds. But it doesn&apos;t stop there.
            Show everyone your offroad builds from trucks, to SxS and ATVs.
          </p>

          <Link href="/sign-up" className="block mt-10">
            <Button type="button" className="w-full">
              Create your build
            </Button>
          </Link>
        </div>

        <div className="w-1/2 bg-gray-100 relative">
          <Image src="/hero.jpg" fill alt="" className="object-cover" />
        </div>
      </section>
    </main>
  );
}
