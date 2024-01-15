import React from "react";
import { H2 } from "../Heading";
import { useDomainUser } from "@/hooks/useDomainUser";
import EmptyListText from "../EmptyListText";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { User } from "lucide-react";
import Link from "next/link";
import FollowItem from "./FollowItem";

const Following = () => {
  const { account } = useDomainUser();
  return (
    <div>
      <H2>Following</H2>
      <p className="text-muted-foreground">
        {account.data?.following?.length ?? 0} follows
      </p>
      <section className="mt-6">
        {account.data?.following?.length === 0 ? (
          <EmptyListText text="Not following anyone" />
        ) : (
          <ul className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {account.data?.following.map((user) => (
              <FollowItem user={user} key={user.uuid} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default Following;
