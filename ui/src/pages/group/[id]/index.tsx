import GroupPrivacyChip from "@/components/GroupPrivacyChip";
import Header from "@/components/Header";
import { H1 } from "@/components/Heading";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { useGroup } from "@/hooks/useGroup";
import clsx from "clsx";
import { Ellipsis, User, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";

const Group = () => {
  const params = useRouter();

  const { group } = useGroup({
    id: params.query.id as string,
  });

  if (!group.data) return null;

  return (
    <main>
      <Header />

      <section className="w-full max-w-screen-xl mx-auto my-10">
        <div className="grid grid-cols-2 gap-10">
          <div
            className={clsx(
              "h-auto aspect-video rounded-lg",
              group.data?.theme?.gradientClass
            )}
          ></div>
          <div className=" flex flex-col gap-3">
            <h1 className="text-4xl font-bold text-foreground">
              {group.data.name}
            </h1>
            <p>{group.data.description}</p>
            <GroupPrivacyChip type={group.data.privacy} />
            <p className="text-muted-foreground flex items-center">
              <Users className="mr-2" size={18} />
              {group.data.members?.length ?? 0} members
            </p>
            <div className="text-muted-foreground flex items-center">
              <User className="mr-2" size={18} />
              <p>
                Created by{" "}
                <span className="font-medium text-foreground">
                  {group.data.admin.username}
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
                <DropdownMenuItem>
                  <Link href={`/group/${group.data.uuid}/edit`}>Edit</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <button
              type="button"
              aria-label="Inactive button used for an example ui piece"
              className={`${buttonVariants({ variant: "default" })}`}
              style={{
                backgroundColor: group.data.theme.color,
              }}
            >
              Join group
            </button>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Group;
