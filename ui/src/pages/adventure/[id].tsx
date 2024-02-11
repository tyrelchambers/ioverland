import { useAdventure } from "@/hooks/useAdventure";
import { useRouter } from "next/router";
import React from "react";

const Adventure = () => {
  const router = useRouter();
  const { adventureById } = useAdventure({
    adventureId: router.query.id as string,
  });

  return <div>Adventure</div>;
};

export default Adventure;
