import { InfoIcon } from "lucide-react";
import React from "react";

const Info = ({ children }: { children: JSX.Element }) => {
  return (
    <div className="bg-indigo-100 p-4 rounded-md border-2 border-indigo-500 flex flex-col lg:flex-row items-center justify-between my-1">
      <div className="flex  gap-3 items-center text-indigo-500">
        <InfoIcon size={16} />
        {children}
      </div>
    </div>
  );
};

export default Info;
