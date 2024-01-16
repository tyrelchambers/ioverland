import React from "react";
import { TabsList, TabsTrigger } from "../ui/tabs";
import { dashboardTabs } from "@/index.routes";

const DesktopTabs = () => {
  return (
    <TabsList className="w-full">
      {dashboardTabs.map(({ icon: Icon, label, tab }) => (
        <TabsTrigger key={label} value={tab}>
          <Icon size={18} className="mr-2" />
          {label}
        </TabsTrigger>
      ))}
    </TabsList>
  );
};

export default DesktopTabs;
