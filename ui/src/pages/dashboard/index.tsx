import BuildItem, { BuildSkeleton } from "@/components/BuildItem";
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
  Sparkle,
  Truck,
  User,
} from "lucide-react";
import { useRouter } from "next/router";
import React from "react";
import { Badge } from "@/components/ui/badge";
import Account from "@/components/dashboard/Account";
import { H2 } from "@/components/Heading";
import EmptyListText from "@/components/EmptyListText";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Profile from "@/components/dashboard/Profile";
import Following from "@/components/dashboard/Following";
import Followers from "@/components/dashboard/Followers";

const Dashboard = () => {
  const router = useRouter();
  const { user: clerkUser } = useUser();
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
        <header className="w-full bg-card py-2">
          <div className="max-w-screen-2xl mx-auto w-full flex justify-between items-center">
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
              <TabsTrigger value="profile">
                <User size={18} className="mr-2" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="follows">
                <Sparkle size={18} className="mr-2" />
                Following
              </TabsTrigger>
              <TabsTrigger value="followers">
                <Sparkle size={18} className="mr-2" />
                Followers
              </TabsTrigger>
            </TabsList>

            <div className="flex gap-3">
              <Link href="/build/new">
                <Button type="button" variant="outline" size="sm">
                  New build
                </Button>
              </Link>
              <Link href={`/user/${clerkUser?.username}`}>
                <Button type="button" size="sm" variant="outline">
                  View profile
                </Button>
              </Link>
            </div>
          </div>
        </header>

        <section className="max-w-screen-2xl mx-auto my-10">
          {!user.isLoading && !user.isPending && !user.data?.username && (
            <div className="p-4 bg-gray-800 text-white rounded-md shadow-md text-sm flex justify-between">
              <div className="flex flex-col">
                <p className="font-bold">No username set for your profile</p>
                <p className="text-white/70">
                  Please update your profile with a username either via the
                  avatar menu in the top right, or via the Profile tab.
                </p>
              </div>

              <Link href="/dashboard?tab=profile">
                <Button variant="secondary" type="button">
                  Go to profile
                </Button>
              </Link>
            </div>
          )}
          <section className="mt-10 p-4 lg:p-0">
            <TabsContent value="builds">
              <H2 className="mb-10">My Builds</H2>

              {user.isLoading ? (
                <ul className="grid grid-cols-1 lg:grid-cols-3 lg:p-0 p-4 gap-6">
                  <BuildSkeleton />
                  <BuildSkeleton />
                  <BuildSkeleton />
                </ul>
              ) : builds && builds.length > 0 ? (
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
                            {build.public && <Badge>public</Badge>}
                          </footer>
                        }
                      />
                    ))}
                </ul>
              ) : (
                <p className="text-card-foreground bg-card p-4 rounded-xl w-full mt-4">
                  No builds to see here
                </p>
              )}
            </TabsContent>
            <TabsContent value="bookmarks">
              <H2>Bookmarks</H2>
              {user.isLoading ? (
                <ul className="grid grid-cols-1 lg:grid-cols-3 lg:p-0 p-4 gap-6">
                  <BuildSkeleton />
                  <BuildSkeleton />
                  <BuildSkeleton />
                </ul>
              ) : bookmarks && bookmarks.length > 0 ? (
                <ul className="grid grid-cols-1 lg:grid-cols-3 p-4 lg:p-0 gap-6">
                  {bookmarks?.map((build) => (
                    <BuildItem build={build} key={build.uuid} />
                  ))}
                </ul>
              ) : (
                <p className="text-card-foreground bg-card p-4 rounded-xl w-full mt-4">
                  No bookmarks to see here
                </p>
              )}
            </TabsContent>

            <TabsContent value="account">
              <Account />
            </TabsContent>

            <TabsContent value="profile">
              <Profile />
            </TabsContent>

            <TabsContent value="follows">
              <Following />
            </TabsContent>

            <TabsContent value="followers">
              <Followers />
            </TabsContent>
          </section>
        </section>
      </Tabs>
    </div>
  );
};

export default Dashboard;
