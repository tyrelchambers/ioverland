import { Globe, Lock } from "lucide-react";
import React from "react";

const GroupPrivacyChip = ({ type }: { type: string }) => {
  if (type === "public") {
    return (
      <div className="flex gap-2 items-center text-muted-foreground text-sm font-medium">
        <Globe size={14} /> <p>Public</p>
      </div>
    );
  }

  return (
    <div className="flex gap-2 items-center text-muted-foreground text-sm font-medium">
      <Lock size={14} /> <p>Private</p>
    </div>
  );
};

export default GroupPrivacyChip;
