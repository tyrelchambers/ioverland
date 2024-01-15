import { useDomainUser } from "@/hooks/useDomainUser";
import React from "react";
import { H2 } from "../Heading";
import EmptyListText from "../EmptyListText";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { User } from "lucide-react";
import FollowItem from "./FollowItem";

const Followers = () => {
  const { account } = useDomainUser();
  return (
    <div>
      <H2>Followers</H2>

      <section className="mt-6">
        {account.data?.followers.length === 0 ? (
          <EmptyListText text="No followers" />
        ) : (
          <ul className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {account.data?.followers.map((user) => (
              <FollowItem user={user} key={user.uuid} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default Followers;
