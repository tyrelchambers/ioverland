import BuildItem from "@/components/BuildItem";
import Header from "@/components/Header";
import { H1, H2, H3 } from "@/components/Heading";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDomainUser } from "@/hooks/useDomainUser";
import {
  Bookmark,
  CarFront,
  Check,
  Fingerprint,
  Heart,
  Zap,
} from "lucide-react";
import { useRouter } from "next/router";
import React from "react";

const Dashboard = () => {
  const router = useRouter();
  const { user, getAccount } = useDomainUser();

  const builds = user.data?.builds;
  const bookmarks = user.data?.bookmarks;
  const account = getAccount.data;

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

              <div className="mt-10 bg-card p-4 rounded-xl w-fit">
                {!account?.hasSubscription ? (
                  <div>
                    <Zap className="text-muted-foreground" />
                    <p className="font-bold mt-6">
                      Not currently subscribed to any plan.
                    </p>
                    <p className="text-muted-foreground text-sm">
                      If you&apos;d like to experience all iOverland has to
                      offer, please purchase a plan.
                    </p>
                    <Drawer>
                      <DrawerTrigger>
                        <Button className="mt-4">Subscribe to Pro</Button>
                      </DrawerTrigger>
                      <DrawerContent>
                        <div className="w-[400px] mx-auto">
                          <DrawerHeader>
                            <DrawerTitle>Choose a plan</DrawerTitle>
                            <DrawerDescription>
                              Paid on a monthly basis.
                            </DrawerDescription>
                          </DrawerHeader>
                          <div className="p-6 rounded-xl border-2 border-primary  m-4 shadow-lg">
                            <p className="mb-4 font-bold text-primary">Pro</p>
                            <p className="text-3xl font-bold">$10</p>
                            <Separator className="my-6" />
                            <p className="text-sm">Gives you access to:</p>
                            <ul className=" flex flex-col gap-4 mt-4 text-sm">
                              <li className="flex items-center gap-2 text-muted-foreground">
                                <Check size={16} className="text-primary" />
                                Multiple builds
                              </li>
                              <li className="flex items-center gap-2 text-muted-foreground">
                                <Check size={16} className="text-primary" />
                                Video support for your builds and trips
                              </li>
                              <li className="flex items-center gap-2 text-muted-foreground">
                                <Check size={16} className="text-primary" />
                                Multiple trips
                              </li>
                            </ul>
                          </div>
                          <DrawerFooter>
                            <Button>Submit</Button>
                            <DrawerClose>
                              <Button variant="outline">Cancel</Button>
                            </DrawerClose>
                          </DrawerFooter>
                        </div>
                      </DrawerContent>
                    </Drawer>
                  </div>
                ) : (
                  <div></div>
                )}
              </div>
            </TabsContent>
          </section>
        </section>
      </Tabs>
    </div>
  );
};

export default Dashboard;
