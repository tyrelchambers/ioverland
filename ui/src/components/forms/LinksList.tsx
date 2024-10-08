import React from "react";
import { Button } from "../ui/button";

const LinksList = ({
  links,
  form,
}: {
  links:
    | {
        [key: string]: string;
      }
    | {};
  form: any;
}) => {
  const removeLinkHandler = (id: string) => {
    const l = form.getValues("links");

    if (l[id]) {
      delete l[id];
    }
    form.setValue("links", l);
  };

  return (
    <>
      {Object.keys(links).length > 0 && (
        <div className="flex flex-col gap-3 mt-6">
          {Object.entries(links).map((input, index) => {
            const id = input[0];
            const link = input[1];

            return (
              <div
                className="flex justify-between border border-border rounded-lg p-4 items-center"
                key={id}
              >
                <p>{link}</p>
                <Button
                  type="button"
                  variant="link"
                  className="text-red-500"
                  size="sm"
                  onClick={() => removeLinkHandler(id)}
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

export default LinksList;
