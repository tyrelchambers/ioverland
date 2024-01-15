import { useDomainUser } from "@/hooks/useDomainUser";
import React from "react";
import { H2 } from "../Heading";
import EmptyListText from "../EmptyListText";
import FollowItem from "./FollowItem";

const Followers = () => {
  const { account } = useDomainUser();
  return (
    <div>
      <H2>Followers</H2>
      <p className="text-muted-foreground">
        {account.data?.followers?.length ?? 0} followers
      </p>
      <section className="mt-6">
        {!account.data?.followers || account.data?.followers?.length === 0 ? (
          <EmptyListText text="No followers" />
        ) : (
          <ul className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {account.data?.followers?.map((user) => (
              <FollowItem user={user} key={user.uuid} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default Followers;
