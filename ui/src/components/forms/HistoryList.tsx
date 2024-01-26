import { History } from "@/types";
import React from "react";
import { Button } from "../ui/button";

const HistoryList = ({
  form,
  history,
}: {
  form: any;
  history: History[] | {};
}) => {
  const removeHandler = (id: string) => {
    const l = form.getValues("history");

    if (l[id]) {
      delete l[id];
    }
    form.setValue("history", l);
  };

  return (
    <>
      {Object.keys(history).length > 0 && (
        <div className="flex flex-col gap-3 mt-6">
          {Object.entries(history).map((input, index) => {
            const id = input[0];
            const data = input[1];

            return (
              <div
                className="flex justify-between border border-border rounded-lg p-4 items-center"
                key={id}
              >
                <div className="flex flex-col">
                  <p className="text-foreground font-medium">{data.event}</p>
                  <p className="text-sm text-muted-foreground">{data.year}</p>
                </div>
                <Button
                  type="button"
                  variant="link"
                  className="text-red-500"
                  size="sm"
                  onClick={() => removeHandler(id)}
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

export default HistoryList;
