import BuildItem, { BuildSkeleton } from "@/components/BuildItem";
import Header from "@/components/Header";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useDomainUser } from "@/hooks/useDomainUser";
import { useRouter } from "next/router";
import React from "react";
import Account from "@/components/dashboard/Account";
import { H2 } from "@/components/Heading";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Profile from "@/components/dashboard/Profile";
import Following from "@/components/dashboard/Following";
import Followers from "@/components/dashboard/Followers";
import EmptyListText from "@/components/EmptyListText";
import DesktopTabs from "@/components/dashboard/DesktopTabs";
import { useViewportWidth } from "@/hooks/useViewportWidth";
import Head from "next/head";
import Builds from "@/components/dashboard/Builds";
import { Adventures } from "@/components/dashboard/Adventures";

const Dashboard = () => {
  const router = useRouter();
  const { width } = useViewportWidth();
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
      <Head>
        <title>Dashboard | WildBarrens</title>
      </Head>
      <Header stickyOnScroll={false} />

      <Tabs
        defaultValue="builds"
        className="w-full"
        value={router.query.tab as string}
        onValueChange={updateUrl}
      >
        <header className="w-full bg-card py-2 px-4">
          <div className="max-w-screen-2xl mx-auto w-full flex flex-col justify-between items-center lg:flex-row">
            {width >= 1024 && <DesktopTabs />}
            <div className="flex gap-3 w-full lg:w-fit">
              <Link href="/build/new" className="w-full">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full lg:w-fit"
                >
                  New build
                </Button>
              </Link>
              <Link href={`/user/${clerkUser?.username}`} className="w-full">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="w-full lg:w-fit"
                >
                  View profile
                </Button>
              </Link>
            </div>
          </div>
        </header>

        <section className="max-w-screen-2xl mx-auto my-10">
          {!user.isLoading && !user.isPending && !user.data?.username && (
            <div className="p-4 bg-gray-800 text-white rounded-md shadow-md text-sm flex justify-between flex-col lg:flex-row gap-4 mx-4 lg:mx-0">
              <div className="flex flex-col">
                <p className="font-bold text-lg">
                  No username set for your profile
                </p>
                <p className="text-white/70 text-sm">
                  Please update your profile with a username either via the
                  avatar menu in the top right, or via the Profile tab.
                </p>
              </div>

              <Link href="/dashboard?tab=profile">
                <Button
                  variant="secondary"
                  type="button"
                  className="w-full lg:w-fit"
                >
                  Go to profile
                </Button>
              </Link>
            </div>
          )}
          <section className="mt-10 p-4 2xl:p-0">
            <TabsContent value="builds">
              <Builds user={user} builds={builds} />
            </TabsContent>
            <TabsContent value="bookmarks">
              <H2 className="mb-4">Bookmarks</H2>
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
                <EmptyListText text="No bookmarks" />
              )}
            </TabsContent>

            <TabsContent value="adventures">
              <Adventures />
            </TabsContent>

            <TabsContent value="account">
              <Account />
            </TabsContent>

            <TabsContent value="profile">
              <Profile />
            </TabsContent>

            <TabsContent value="following">
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
