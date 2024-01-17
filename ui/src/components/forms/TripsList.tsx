import { Trip } from "@/types";
import React from "react";
import { Button } from "../ui/button";

const TripsList = ({ trips, form }: { trips: Trip[] | {}; form: any }) => {
  const removeTripHandler = (id: string) => {
    const ts = form.getValues("trips");

    if (ts[id]) {
      delete ts[id];
    }

    form.setValue("trips", ts);
  };
  return (
    <>
      {Object.keys(trips).length > 0 && (
        <div className="flex flex-col mt-6 gap-2">
          {Object.entries(trips).map((input) => {
            const id = input[0];
            const trip = input[1] as Trip;

            return (
              <div
                className="flex justify-between border border-border rounded-lg p-4 items-center"
                key={id}
              >
                <div className="flex flex-1 flex-col lg:flex-row gap-4">
                  <p className="font-bold text-card-foreground">{trip.name}</p>
                  <p className="text-card-foreground">{trip.year}</p>
                </div>
                <footer className="flex flex-row justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    className="text-red-500"
                    size="sm"
                    onClick={() => removeTripHandler(id)}
                  >
                    Remove
                  </Button>
                </footer>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
};

export default TripsList;
