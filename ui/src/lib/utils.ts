import { modificationCategories } from "@/constants";
import { Modification } from "@/types";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const findCategory = (category: string | undefined) => {
  if (!category) return undefined;
  return modificationCategories.find((d) => d.value === category);
};

export const findCategorySubcategories = (category: string) => {
  return modificationCategories.find((d) => d.value === category)
    ?.subcategories;
};

export const findSubcategory = (category: string, subcategory: string) => {
  return modificationCategories
    .find((d) => d.value === category)
    ?.subcategories?.find((d) => d.value === subcategory);
};

export const groupModificationsByCategory = (mods: Modification[]) => {
  const grouped: { [key: string]: Modification[] } = {};
  mods.forEach((m) => {
    if (!m.category) return;
    if (!grouped[m.category]) grouped[m.category] = [];
    grouped[m.category].push(m);
  });
  return grouped;
};
