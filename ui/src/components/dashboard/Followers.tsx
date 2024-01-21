import { useDomainUser } from "@/hooks/useDomainUser";
import React from "react";
import { H2 } from "../Heading";
import FollowItem from "./FollowItem";

const Followers = () => {
  const { user } = useDomainUser();
  return (
    <div>
      <H2>Followers</H2>
      <p className="text-muted-foreground">
        {user.data?.followers?.length ?? 0} followers
      </p>
      <section className="mt-6">
        {!user.data?.followers ||
          (user.data?.followers?.length > 0 && (
            <ul className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {user.data?.followers?.map((user) => (
                <FollowItem user={user} key={user.uuid} />
              ))}
            </ul>
          ))}
      </section>
    </div>
  );
};

export default Followers;
