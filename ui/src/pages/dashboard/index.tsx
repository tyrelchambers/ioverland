import BuildItem from "@/components/BuildItem";
import Header from "@/components/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDomainUser } from "@/hooks/useDomainUser";
import {
  Bookmark,
  Car,
  CarFront,
  Fingerprint,
  Grid2X2,
  Heart,
  Truck,
} from "lucide-react";
import { useRouter } from "next/router";
import React from "react";
import { Badge } from "@/components/ui/badge";
import Account from "@/components/dashboard/Account";
import { H2 } from "@/components/Heading";

const Dashboard = () => {
  const router = useRouter();

  const { user } = useDomainUser();

  const builds = user.data?.builds;
  const bookmarks = user.data?.bookmarks;

  const updateUrl = (tab: string) => {
    router.push({
      query: {
        ...router.query,
        tab,
      },
    });
  };

  return (
    <div>
      <Header stickyOnScroll={false} />

      <Tabs
        defaultValue="builds"
        className="w-full"
        value={router.query.tab as string}
        onValueChange={updateUrl}
      >
        <header className="w-full bg-card ">
          <div className="max-w-screen-xl mx-auto w-full">
            <TabsList>
              <TabsTrigger value="builds">
                <Grid2X2 size={18} className="mr-2" />
                Builds
              </TabsTrigger>
              <TabsTrigger value="bookmarks">
                <Bookmark size={18} className="mr-2" />
                Bookmarks
              </TabsTrigger>
              <TabsTrigger value="account">
                <Fingerprint size={18} className="mr-2" />
                Account
              </TabsTrigger>
            </TabsList>
          </div>
        </header>
        <section className="max-w-screen-2xl mx-auto my-10">
          <section className="mt-10">
            <TabsContent value="builds">
              <H2 className="mb-10">My Builds</H2>
              <ul className="grid grid-cols-1 lg:grid-cols-3 lg:p-0 p-4 gap-6">
                {builds
                  ?.toSorted((a, b) => (a.name > b.name ? 1 : -1))
                  ?.map((build) => (
                    <BuildItem
                      build={build}
                      key={build.uuid}
                      footer={
                        <footer className="flex mt-2 gap-4">
                          <div className="flex text-muted-foreground items-center">
                            <Heart size={16} className="mr-1" />
                            <p className="text-sm">
                              {build.likes?.length ?? 0}
                            </p>
                          </div>
                          {build.private && <Badge>Private</Badge>}
                        </footer>
                      }
                    />
                  ))}
              </ul>
            </TabsContent>
            <TabsContent value="bookmarks">
              <H2>Bookmarks</H2>
              <ul className="grid grid-cols-1 lg:grid-cols-3 p-4 gap-6">
                {bookmarks?.map((build) => (
                  <BuildItem build={build} key={build.uuid} />
                ))}
              </ul>
            </TabsContent>

            <TabsContent value="account" className="p-4">
              <Account />
            </TabsContent>
          </section>
        </section>
      </Tabs>
    </div>
  );
};

export default Dashboard;
