import React from "react";
import { H2 } from "../Heading";
import { useDomainUser } from "@/hooks/useDomainUser";

const Groups = () => {
  const { groups } = useDomainUser();

  return (
    <div>
      <header className="mb-10 flex gap-4 items-baseline">
        <H2>My Groups</H2>
      </header>

      <div className="grid grid-cols-3 gap-10">
        {groups.data?.map((g) => (
          <div key={g.uuid} className="border border-border p-4 rounded-md">
            <p className="text-foreground font-medium">{g.name}</p>
            <p className="text-muted-foreground">{g.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Groups;
