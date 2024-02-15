import React from "react";
import { H2 } from "../Heading";
import { useAdventure } from "@/hooks/useAdventure";
import { useDomainUser } from "@/hooks/useDomainUser";
import { BuildSkeleton } from "../BuildItem";
import AdventureItem from "../AdventureItem";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Eye,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Pencil,
} from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";
import { Badge } from "../ui/badge";

export const Adventures = () => {
  const { user } = useDomainUser();
  const { adventures } = useAdventure({
    userId: user.data?.uuid,
  });
  return (
    <div>
      <H2 className="mb-10">My Adventures</H2>

      {user.isLoading ? (
        <ul className="grid grid-cols-1 lg:grid-cols-3 lg:p-0 p-4 gap-6">
          <BuildSkeleton />
          <BuildSkeleton />
          <BuildSkeleton />
        </ul>
      ) : adventures.data && adventures.data.length > 0 ? (
        <ul className="grid grid-cols-1 lg:grid-cols-3 lg:p-0 p-4 gap-6">
          {adventures.data
            ?.toSorted((a, b) => (a.name > b.name ? 1 : -1))
            ?.map((adv) => (
              <AdventureItem
                adventure={adv}
                key={adv.uuid}
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
                          href={`/adventure/${adv.uuid}/edit`}
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
                      <p className="text-sm">{adv.views ?? 0}</p>
                    </div>
                    <div className="flex text-muted-foreground items-center">
                      <Heart size={16} className="mr-1" />
                      <p className="text-sm">{adv.likes?.length ?? 0}</p>
                    </div>
                    <div className="flex text-muted-foreground items-center">
                      <MessageCircle size={16} className="mr-1" />
                      <p className="text-sm">{adv.comments?.length ?? 0}</p>
                    </div>
                    {/* {adv.public && <Badge variant="secondary">public</Badge>} */}
                  </footer>
                }
              />
            ))}
        </ul>
      ) : (
        <p className="text-card-foreground bg-card p-4 rounded-xl w-full mt-4">
          No adventures to see here
        </p>
      )}
    </div>
  );
};
