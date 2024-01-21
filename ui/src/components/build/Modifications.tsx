import {
  findCategory,
  formatPrice,
  groupModificationsByCategory,
} from "@/lib/utils";
import { Modification } from "@/types";
import React from "react";
import EmptyListText from "../EmptyListText";

const Modifications = ({
  modifications,
}: {
  modifications: Modification[] | undefined;
}) => {
  if (!modifications || modifications.length === 0)
    return <EmptyListText text="No modifications" />;
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {Object.entries(groupModificationsByCategory(modifications)).map(
        ([i, mod]) => {
          const category = findCategory(i);

          return (
            <div key={i} className="border-border border rounded-xl p-4">
              <p className="font-serif text-xl mb-6">{category?.label}</p>
              <ul className="flex flex-col  gap-4">
                {mod.map((mod) => (
                  <li
                    key={mod.id}
                    className="flex justify-between odd:bg-card p-2 px-4 rounded-md items-center"
                  >
                    <div className="flex flex-col">
                      <p className="font-bold">{mod.name}</p>
                      <p className="text-card-foreground text-sm">
                        {mod.subcategory}
                      </p>
                    </div>
                    <p className="text-foreground">
                      {formatPrice(Number(mod.price))}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          );
        }
      )}
    </div>
  );
};

export default Modifications;
