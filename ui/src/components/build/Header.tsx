import { Build } from "@/types";
import React from "react";
import { H1 } from "../Heading";
import { Bookmark, Eye, PencilRuler } from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";
import { useBuild } from "@/hooks/useBuild";
import { toast } from "sonner";

const BuildHeader = ({
  build,
  liked,
  likeBtn,
  canEdit,
}: {
  build: Build;
  liked: boolean;
  likeBtn: JSX.Element;
  canEdit: boolean;
}) => {
  const { bookmarkBuild } = useBuild(build.uuid);

  const bookmarkHandler = () => {
    bookmarkBuild.mutate(undefined, {
      onSuccess: () => {
        toast.success("Build bookmarked");
      },
    });
  };
  return (
    <header className="flex flex-col">
      <span className="flex items-center text-muted-foreground gap-1 mb-4">
        {liked !== undefined && likeBtn}
      </span>
      <div className="flex justify-between items-center w-full">
        <H1 className="text-7xl font-serif font-light mb-8">{build?.name}</H1>

        <div className="flex items-center gap-3">
          <p className=" text-muted-foreground flex items-center">
            <Eye size={20} className="text-muted-foreground mr-2" />{" "}
            {build.views}
          </p>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={bookmarkHandler}
          >
            <Bookmark size={18} className="text-muted-foreground" />
          </Button>

          {canEdit && (
            <Button size="sm" asChild>
              <Link
                href={`/build/${build?.uuid}/edit`}
                className="text-green-foreground"
              >
                <PencilRuler size={18} className="mr-2" />
                Edit
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default BuildHeader;
