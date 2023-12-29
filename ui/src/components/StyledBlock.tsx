import { cn } from "@/lib/utils";
import { ImageIcon, LucideIcon } from "lucide-react";
import React from "react";

const StyledBlock = ({
  icon,
  text,
  className,
}: {
  icon: JSX.Element;
  className?: string;
  text?: string;
}) => {
  return (
    <div
      className={cn(
        "w-full h-full bg-gradient-to-tr from-gray-300 to-muted  text-muted-foreground flex justify-center items-center flex-col p-8",
        className
      )}
    >
      {icon}

      {text && <p className="text-balance text-center mt-4">{text}</p>}
    </div>
  );
};

export default StyledBlock;
