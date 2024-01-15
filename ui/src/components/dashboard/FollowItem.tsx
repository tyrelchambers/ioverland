import Link from "next/link";
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { User } from "lucide-react";

const FollowItem = ({
  user,
}: {
  user: { username: string; image_url: string; uuid: string };
}) => {
  return (
    <Link
      href={`/user/${user.username}`}
      className="bg-card p-3 rounded-full flex items-center hover:border-2 border-2 hover:border-primary"
    >
      <Avatar className="w-10 h-10 border-2 mr-4 border-white  shadow-xl">
        <AvatarFallback>
          <User />
        </AvatarFallback>
        <AvatarImage src={user.image_url} />
      </Avatar>
      <p className="text-card-foreground">{user.username}</p>
    </Link>
  );
};

export default FollowItem;
