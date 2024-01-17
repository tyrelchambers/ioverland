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

export const removeTrip = (data: { [key: string]: Trip }, id: string) => {
  const trips = { ...data };
  delete trips[id];

  return trips;
};

export const formattedModifications = (
  data: { [key: string]: Modification },
  extras?: { [key: string]: unknown }
) => {
  const id = createId();
  const mods = { ...data };
  mods[id] = {
    category: "",
    subcategory: "",
    name: "",
    price: "0",
    ...extras,
  };

  return mods;
};

export const removeModification = (
  data: { [key: string]: Modification },
  id: string
) => {
  const mods = { ...data };
  delete mods[id];

  return mods;
};

export const formattedLinks = (data: { [key: string]: string }) => {
  const id = createId();
  const links = { ...data };
  links[id] = "";

  return links;
};

export const removeLink = (data: { [key: string]: string }, id: string) => {
  const links = { ...data };
  delete links[id];

  return links;
};
