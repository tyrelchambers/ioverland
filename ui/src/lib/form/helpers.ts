import { Modification, Trip } from "@/types";
import { createId } from "@paralleldrive/cuid2";

export const formattedTrips = (
  id: string,
  data: { [key: string]: Trip },
  extras?: { [key: string]: unknown }
) => {
  const trips = { ...data };
  trips[id] = {
    name: "",
    year: "0",
    ...extras,
  };

  return trips;
};
