import { dashboardTabs } from "@/index.routes";
import { ArrowBigDownDash, Grid2X2 } from "lucide-react";
import React from "react";
import { TabsList, TabsTrigger } from "../ui/tabs";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";

const MobileTabs = () => {
  return (
    <TabsList className="w-full mb-4">
      <Collapsible className="w-full">
        <CollapsibleTrigger className="flex gap-10 border border-border p-2 rounded-md w-full justify-between">
          Tabs <ArrowBigDownDash />
        </CollapsibleTrigger>
        <CollapsibleContent className="flex flex-col items-start">
          {dashboardTabs.map(({ icon: Icon, label, tab }) => (
            <TabsTrigger
              key={label}
              className="my-2 w-full justify-start lg:my-2 lg:w-full lg:justify-normal"
              value={tab}
            >
              <Icon size={18} className="mr-2" />
              {label}
            </TabsTrigger>
          ))}
        </CollapsibleContent>
      </Collapsible>
    </TabsList>
  );
};

export default MobileTabs;
