import React from "react";
import { H2 } from "../Heading";
import { useDomainUser } from "@/hooks/useDomainUser";
import EmptyListText from "../EmptyListText";
import FollowItem from "./FollowItem";

const Following = () => {
  const { user } = useDomainUser();
  return (
    <div>
      <H2>Following</H2>
      <p className="text-muted-foreground">
        {user.data?.following?.length ?? 0} following
      </p>
      <section className="mt-6">
        {user.data?.following?.length === 0 ? (
          <EmptyListText text="Not following anyone" />
        ) : (
          <ul className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {user.data?.following?.map((user) => (
              <FollowItem user={user} key={user.uuid} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default Following;
