import GroupPrivacyChip from "@/components/GroupPrivacyChip";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { useDomainUser } from "@/hooks/useDomainUser";
import { useGroup } from "@/hooks/useGroup";
import { checkMembership } from "@/lib/utils";
import clsx from "clsx";
import { Ellipsis, User, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useMemo } from "react";

const Group = () => {
  const { user } = useDomainUser();
  const params = useRouter();

  const { group, join, leave } = useGroup({
    id: params.query.id as string,
  });

  const groupDetails = group.data?.group;

  if (!groupDetails) return null;

  const joinHandler = () => {
    join.mutate(groupDetails.uuid);
  };

  const leaveHandler = () => {
    leave.mutate(groupDetails.uuid);
  };

  return (
    <main>
      <Header />

      <section className="w-full max-w-screen-xl mx-auto my-10">
        <div className="grid grid-cols-2 gap-10">
          <div
            className={clsx(
              "h-auto aspect-video rounded-lg",
              groupDetails.theme?.gradientClass
            )}
          ></div>
          <div className=" flex flex-col gap-3">
            <h1 className="text-4xl font-bold text-foreground">
              {groupDetails.name}
            </h1>
            <p>{groupDetails.description}</p>
            <GroupPrivacyChip type={groupDetails.privacy} />
            <p className="text-muted-foreground flex items-center">
              <Users className="mr-2" size={18} />
              {groupDetails.members?.length ?? 0} members
            </p>
            <div className="text-muted-foreground flex items-center">
              <User className="mr-2" size={18} />
              <p>
                Created by{" "}
                <span className="font-medium text-foreground">
                  {groupDetails.admin.username}
                </span>
              </p>
            </div>
          </div>
        </div>

        <Separator className="my-4" />

        <div className="flex justify-between">
          <div className="flex gap-2">
            <p className="py-2 px-4 text-muted-foreground">Home</p>
            <p className="py-2 px-4 text-muted-foreground">About</p>
          </div>

          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="outline">
                  <Ellipsis />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <Link href={`/group/${groupDetails.uuid}/edit`}>
                  <DropdownMenuItem>Edit</DropdownMenuItem>
                </Link>
                <Link href={`/group/${groupDetails.uuid}/requests`}>
                  <DropdownMenuItem>Join requests</DropdownMenuItem>
                </Link>
              </DropdownMenuContent>
            </DropdownMenu>
            {user.data?.uuid && groupDetails.adminId !== user.data?.uuid && (
              <>
                {group.data?.is_member ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={leaveHandler}
                  >
                    Leave group
                  </Button>
                ) : group.data?.is_pending_member ? (
                  <Button variant="outline" disabled>
                    Request pending
                  </Button>
                ) : (
                  <Button
                    type="button"
                    style={{
                      backgroundColor: groupDetails.theme.color,
                    }}
                    onClick={joinHandler}
                  >
                    {groupDetails.privacy === "private"
                      ? "Request to Join"
                      : "Join"}
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </section>
    </main>
  );
};

export default Group;
