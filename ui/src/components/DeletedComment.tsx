import { cn } from "@/lib/utils";
import React from "react";

const DeletedComment = ({ isReply }: { isReply?: boolean }) => {
  return (
    <div
      className={cn(
        "bg-card border border-border p-3 rounded-md my-6",
        isReply && "md:ml-20 ml-6"
      )}
    >
      <p className="text-card-foreground italic text-sm">
        This comment has been deleted.
      </p>
    </div>
  );
};

export default DeletedComment;
