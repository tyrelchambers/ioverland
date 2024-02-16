import { cn } from "@/lib/utils";
import { VariantProps, cva } from "class-variance-authority";
import { InfoIcon } from "lucide-react";
import React from "react";

const infoVariant = cva(
  "p-4 rounded-md border-2 flex flex-col lg:flex-row items-center justify-between my-1",
  {
    variants: {
      variant: {
        default: "bg-indigo-100  border-indigo-500 text-indigo-500",
        warning: "bg-yellow-100 border-yellow-500 text-yellow-700",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface InfoProps extends VariantProps<typeof infoVariant> {
  children: JSX.Element;
  className?: string;
}

const Info = ({ children, variant, className }: InfoProps) => {
  return (
    <div className={cn(infoVariant({ variant, className }))}>
      <div className="flex gap-3 items-center ">
        <InfoIcon size={16} />
        {children}
      </div>
    </div>
  );
};

export default Info;
