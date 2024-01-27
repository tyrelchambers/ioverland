import React from "react";
import { H2 } from "../Heading";
import { UseQueryResult } from "@tanstack/react-query";
import { Build, DomainUser } from "@/types";
import BuildItem, { BuildSkeleton } from "../BuildItem";
import {
  CircleEllipsis,
  Eye,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Pencil,
} from "lucide-react";
import { Badge } from "../ui/badge";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";

const Builds = ({
  user,
  builds,
}: {
  user: UseQueryResult<DomainUser, Error>;
  builds: Build[] | undefined;
}) => {
  return (
    <div>
      <H2 className="mb-10">My Builds</H2>

      {user.isLoading ? (
        <ul className="grid grid-cols-1 lg:grid-cols-3 lg:p-0 p-4 gap-6">
          <BuildSkeleton />
          <BuildSkeleton />
          <BuildSkeleton />
        </ul>
      ) : builds && builds.length > 0 ? (
        <ul className="grid grid-cols-1 lg:grid-cols-3 lg:p-0 p-4 gap-6">
          {builds
            ?.toSorted((a, b) => (a.name > b.name ? 1 : -1))
            ?.map((build) => (
              <BuildItem
                build={build}
                key={build.uuid}
                actions={
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <Button type="button" size="icon" variant="ghost">
                        <MoreHorizontal className="text-foreground/50" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem>
                        <Link
                          href={`/build/${build.uuid}/edit`}
                          className="flex items-center w-full hover:underline"
                        >
                          <Pencil size={14} className="mr-2" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                }
                footer={
                  <footer className="flex mt-2 gap-4">
                    <div className="flex text-muted-foreground items-center">
                      <Eye size={16} className="mr-1" />
                      <p className="text-sm">{build.views ?? 0}</p>
                    </div>
                    <div className="flex text-muted-foreground items-center">
                      <Heart size={16} className="mr-1" />
                      <p className="text-sm">{build.likes?.length ?? 0}</p>
                    </div>
                    <div className="flex text-muted-foreground items-center">
                      <MessageCircle size={16} className="mr-1" />
                      <p className="text-sm">{build.comments?.length ?? 0}</p>
                    </div>
                    {build.public && <Badge variant="secondary">public</Badge>}
                  </footer>
                }
              />
            ))}
        </ul>
      ) : (
        <p className="text-card-foreground bg-card p-4 rounded-xl w-full mt-4">
          No builds to see here
        </p>
      )}
    </div>
  );
};

export default Builds;
