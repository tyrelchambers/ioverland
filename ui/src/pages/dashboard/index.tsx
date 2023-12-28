import BuildItem from "@/components/BuildItem";
import Header from "@/components/Header";
import { H1, H2, H3 } from "@/components/Heading";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDomainUser } from "@/hooks/useDomainUser";
import { Bookmark, CarFront, Fingerprint, Heart } from "lucide-react";
import { useRouter } from "next/router";
import React from "react";

const Dashboard = () => {
  const router = useRouter();
  const { user, getStripeAccount } = useDomainUser();

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
      <Header />

      <Tabs
        defaultValue="builds"
        className="w-full"
        value={router.query.tab as string}
        onValueChange={updateUrl}
      >
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
              <ul className="grid grid-cols-3 gap-6">
                {builds?.map((build) => (
                  <BuildItem
                    build={build}
                    key={build.uuid}
                    footer={
                      <footer className="flex mt-2">
                        <div className="flex text-muted-foreground items-center">
                          <Heart size={16} className="mr-1" />
                          <p className="text-sm">{build.likes?.length}</p>
                        </div>
                      </footer>
                    }
                  />
                ))}
              </ul>
            </TabsContent>
            <TabsContent value="bookmarks">
              <ul className="grid grid-cols-3 gap-6">
                {bookmarks?.map((build) => (
                  <BuildItem build={build} key={build.uuid} />
                ))}
              </ul>
            </TabsContent>

            <TabsContent value="account">
              <H3>Subscription</H3>
              <p className="text-muted-foreground">
                Your subscription is managed by Stripe.
              </p>

              <div></div>
            </TabsContent>
          </section>
        </section>
      </Tabs>
    </div>
  );
};

export default Dashboard;
