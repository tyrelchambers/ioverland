import { Modification } from "@/types";
import React from "react";
import { Button } from "../ui/button";
import { findCategory, findSubcategory, formatPrice } from "@/lib/utils";

const ModsList = ({ mods, form }: { mods: Modification[] | {}; form: any }) => {
  const removeModificationHandler = (id: string) => {
    const mods = { ...form.getValues("modifications") };

    if (mods[id]) {
      delete mods[id];
    }

    form.setValue("modifications", mods);
  };
  return (
    <>
      {Object.keys(mods).length > 0 && (
        <div className="flex flex-col gap-3 mt-6">
          {Object.entries(mods).map((input, index) => {
            const id = input[0];
            const mod = input[1] as Modification;

            const cat = findCategory(mod.category);
            let subCat = undefined;

            if (cat && mod.subcategory) {
              subCat = findSubcategory(cat.value, mod.subcategory);
            }

            return (
              <div
                className="flex justify-between border border-border rounded-lg p-4"
                key={id}
              >
                <div className="flex flex-col gap-2">
                  <p className="font-bold">{mod?.name}</p>

                  <div className="text-sm text-muted-foreground flex gap-2">
                    <p>{cat?.label}</p>/<p>{subCat?.label}</p>
                  </div>
                  {mod.price && (
                    <p className="text-sm">{formatPrice(Number(mod.price))}</p>
                  )}
                </div>
                <Button
                  type="button"
                  variant="link"
                  className="text-red-500"
                  size="sm"
                  onClick={() => removeModificationHandler(id)}
                >
                  Remove
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
};

export default ModsList;
