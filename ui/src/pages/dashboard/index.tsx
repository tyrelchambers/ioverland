import Header from "@/components/Header";
import { H1 } from "@/components/Heading";
import ImageWithFallback from "@/components/ImageWithFallback";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDomainUser } from "@/hooks/useDomainUser";
import { Bookmark, CarFront, Heart } from "lucide-react";
import Link from "next/link";
import React from "react";

const Dashboard = () => {
  const { user } = useDomainUser();

  const builds = user.data?.builds;
  const bookmarks = user.data?.bookmarks;

  return (
    <div>
      <Header />

      <Tabs defaultValue="builds" className="w-full" onChange={console.log}>
        <header className="w-full bg-muted flex flex-row p-4">
          <div className="max-w-screen-2xl mx-auto w-full flex items-center gap-6">
            <H1 className="!text-xl text-muted-foreground">Dashboard</H1>
            <TabsList>
              <TabsTrigger value="builds">
                <CarFront size={18} className="mr-2" />
                Builds
              </TabsTrigger>
              <TabsTrigger value="bookmarks">
                <Bookmark size={18} className="mr-2" />
                Bookmarks
              </TabsTrigger>
            </TabsList>
          </div>
        </header>
        <section className="max-w-screen-2xl mx-auto my-10">
          <section className="mt-10">
            <TabsContent value="builds">
              <ul className="grid grid-cols-3 gap-6">
                {builds?.map((build) => (
                  <Link
                    href={`/build/${build.uuid}`}
                    key={build.uuid}
                    className="builds-item"
                  >
                    <div>
                      <header className="relative h-[240px] shadow-md">
                        <ImageWithFallback url={build.banner?.url} />
                      </header>
                      <p className="mt-3 font-bold text-xl font-serif text-foreground">
                        {build.name}
                      </p>
                      <p className="text-muted-foreground line-clamp-3 text-sm mt-1">
                        {build.description}
                      </p>

                      <footer className="flex mt-2">
                        <div className="flex text-muted-foreground items-center">
                          <Heart size={16} className="mr-1" />
                          <p className="text-sm">{build.likes?.length}</p>
                        </div>
                      </footer>
                    </div>
                  </Link>
                ))}
              </ul>
            </TabsContent>
            <TabsContent value="bookmarks">
              <ul className="grid grid-cols-3 gap-6">
                {bookmarks?.map((build) => (
                  <Link
                    href={`/build/${build.uuid}`}
                    key={build.uuid}
                    className="builds-item"
                  >
                    <div>
                      <header className="relative h-[240px] shadow-md">
                        <ImageWithFallback url={build.banner?.url} />
                      </header>
                      <p className="mt-3 font-bold text-xl font-serif text-foreground">
                        {build.name}
                      </p>
                      <p className="text-muted-foreground line-clamp-3 text-sm mt-1">
                        {build.description}
                      </p>
                    </div>
                  </Link>
                ))}
              </ul>
            </TabsContent>
          </section>
        </section>
      </Tabs>
    </div>
  );
};

export default Dashboard;
