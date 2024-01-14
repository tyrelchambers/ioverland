import BuildItem, { BuildSkeleton } from "@/components/BuildItem";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { H2 } from "@/components/Heading";
import LargeHeader from "@/components/public-user-page/LargeHeader";
import MobileHeader from "@/components/public-user-page/MobileHeader";
import { useDomainUser } from "@/hooks/useDomainUser";
import { useRouter } from "next/router";
import React from "react";

const Profile = () => {
  const { username } = useRouter().query;

  const { publicUser } = useDomainUser({ username: username as string });

  if (!publicUser.data) return null;

  return (
    <div>
      <Header />

      <MobileHeader data={publicUser.data} banner={publicUser.data?.banner} />
      <LargeHeader data={publicUser.data} banner={publicUser.data?.banner} />

      <section className="max-w-screen-xl mx-auto p-4 lg:p-0">
        <H2 className="mb-10">Builds</H2>

        {publicUser.isLoading ? (
          <ul className="grid grid-cols-1 lg:grid-cols-3 lg:p-0 p-4 gap-6">
            <BuildSkeleton />
            <BuildSkeleton />
            <BuildSkeleton />
          </ul>
        ) : publicUser.data?.builds && publicUser.data?.builds.length > 0 ? (
          <ul className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {publicUser.data?.builds
              ?.toSorted((a, b) => (a.name > b.name ? 1 : -1))
              ?.map((build) => (
                <BuildItem build={build} key={build.uuid} />
              ))}
          </ul>
        ) : (
          <p className="text-card-foreground bg-card p-4 rounded-xl w-full mt-4">
            No builds to see here
          </p>
        )}
      </section>
      <Footer />
    </div>
  );
};

export default Profile;
