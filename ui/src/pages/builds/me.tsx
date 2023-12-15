import { useBuilds } from "@/hooks/useBuilds";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import React from "react";

const Me = () => {
  const { user } = useUser();
  const { builds } = useBuilds(user?.id);

  console.log(builds);

  return <div>Me</div>;
};

export default Me;
