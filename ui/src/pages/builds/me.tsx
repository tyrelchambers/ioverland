import { useBuilds } from "@/hooks/useBuilds";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import React from "react";

const Me = () => {
  const { user } = useUser();
  const { builds } = useBuilds(user?.id);

  return (
    <div>
      {builds.data?.map((build) => (
        <Link href={`/build/${build.uuid}`} key={build.uuid}>
          <div>
            <p>{build.name}</p>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default Me;
