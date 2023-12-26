import { Trip } from "@/types";
import React from "react";

const Trips = ({ trips }: { trips: Trip[] | undefined }) => {
  if (!trips || trips.length === 0) return <div>No trips</div>;

  return (
    <div className="flex flex-col gap-3">
      {trips.map((trip) => (
        <div
          key={trip.uuid}
          className="border border-border rounded-xl p-3 flex justify-between items-start"
        >
          <p className="font-bold">{trip.name}</p>
          <p>{trip.year}</p>
        </div>
      ))}
    </div>
  );
};

export default Trips;
