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
  Calendar,
  CarFront,
  Check,
  Fingerprint,
  Heart,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import { format } from "date-fns";
import { ToastAction } from "@radix-ui/react-toast";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { env } from "next-runtime-env";

const Dashboard = () => {
  const router = useRouter();

  const {
    user,
    account: { data: account },
    createPortal,
    deleteUser,
    restoreUser,
    createCheckoutLink,
  } = useDomainUser();

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

  const getPortalLink = async () => {
    const data = await createPortal.mutateAsync();

    window.location.href = data.url;
  };

  const deleteHandler = () => {
    deleteUser.mutate();
  };

  const restoreHandler = () => {
    restoreUser.mutate();
  };

  const getCheckoutLink = async () => {
    const data = await createCheckoutLink.mutateAsync({
      redirect_to: `${env("NEXT_PUBLIC_FRONTEND_URL")}/dashboard?tab=account`,
    });

    if (data.url) {
      window.location.href = data.url;
    }
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
        <header className="w-full bg-muted">
          <TabsList className="w-full mx-auto">
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
        </header>
        <section className="max-w-screen-2xl mx-auto my-10">
          <section className="mt-10">
            <TabsContent value="builds">
              <ul className="grid grid-cols-1 lg:grid-cols-3 p-4 gap-6">
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
              <ul className="grid grid-cols-1 lg:grid-cols-3 p-4 gap-6">
                {bookmarks?.map((build) => (
                  <BuildItem build={build} key={build.uuid} />
                ))}
              </ul>
            </TabsContent>

            <TabsContent value="account" className="p-4">
              <section className="mb-10">
                <H3>Builds</H3>
                <p className="text-muted-foreground max-w-3xl">
                  This is the number of builds you&apos;ve created according to
                  your plan type.{" "}
                  {account?.has_subscription &&
                    "You have can have up to 5 builds since you are on the Pro plan."}
                </p>

                <Badge className="mt-4">
                  {account?.total_builds} builds / {account?.builds_remaining}{" "}
                  remaining
                </Badge>
              </section>
              <Separator className="my-10" />
              <section>
                <H3>Subscription</H3>
                <p className="text-muted-foreground">
                  Your subscription is managed by Stripe.
                </p>
                <p className="text-muted-foreground max-w-2xl mt-2 italic">
                  Please keep in mind if you cancel your subscription, your
                  builds will be made private except for the first one you
                  created.
                </p>

                <div className="mt-10 bg-card p-4 rounded-xl w-full max-w-[500px]">
                  {account?.has_subscription ? (
                    <div>
                      <p className="font-bold flex gap-4">
                        <Zap className="text-card-foreground" />
                        You are currently subscribed to the Pro plan!
                      </p>
                      <p className="mt-4 text-card-foreground">
                        ${account.subscription.price / 100}/month
                      </p>
                      <p className="mt-4 text-sm text-card-foreground">
                        Next invoice date:{" "}
                        {format(
                          new Date(account.subscription.next_invoice_date),
                          "MMMM dd, yyyy"
                        )}
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        className="mt-6"
                        onClick={getPortalLink}
                      >
                        Manage subscription
                      </Button>
                    </div>
                  ) : (
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
                        <DrawerTrigger asChild>
                          <Button className="mt-4">Subscribe to Pro</Button>
                        </DrawerTrigger>
                        <DrawerContent>
                          <div className="max-w-[400px] w-full mx-auto">
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
                              <Button
                                type="button"
                                onClick={getCheckoutLink}
                                className="w-full"
                              >
                                Submit
                              </Button>
                              <DrawerClose>Cancel</DrawerClose>
                            </DrawerFooter>
                          </div>
                        </DrawerContent>
                      </Drawer>
                    </div>
                  )}
                </div>
              </section>

              <Separator className="my-10" />
              <H3>Delete account</H3>
              <p className="max-w-3xl text-muted-foreground">
                Tread lightly here. Delete your account forever. If you are
                subscribed to a plan, it will delete at the end of the billing
                cycle.
              </p>

              {account?.deleted_at && (
                <div className="bg-yellow-100 rounded-xl text-yellow-700 flex flex-col gap-2 overflow-hidden max-w-2xl w-full my-6 shadow-lg">
                  <div className="flex flex-col gap-2 p-4">
                    <p>Plan and account are set to delete on: </p>
                    <p className="font-bold flex items-center">
                      <Calendar className="mr-2" size={18} />
                      {format(new Date(account.deleted_at), "MMMM dd, yyyy")}
                    </p>
                  </div>

                  <footer className="bg-yellow-400 p-4 flex items-center justify-between">
                    <p className="text-yellow-900">
                      Want to cancel the deletion and keep your account and your
                      plan?
                    </p>

                    <Button variant="secondary" onClick={restoreHandler}>
                      {restoreUser.isPending ? "Restoring..." : "Restore"}
                    </Button>
                  </footer>
                </div>
              )}

              {!account?.deleted_at && (
                <Button
                  variant="destructiveMuted"
                  className="mt-6"
                  onClick={deleteHandler}
                  type="button"
                >
                  {deleteUser.isPending ? "Deleting..." : "Delete account"}
                </Button>
              )}
            </TabsContent>
          </section>
        </section>
      </Tabs>
    </div>
  );
};

export default Dashboard;
