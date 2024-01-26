import {
  MAX_FILE_SIZE,
  MAX_FILE_SIZE_PRO,
  modificationCategories,
} from "@/constants";
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

export const findCategorySubcategories = (category: string | undefined) => {
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

export const hasLiked = (
  likes: string[] | null | undefined,
  user_id: string
) => {
  if (!likes) return false;
  return likes.some((like) => like === user_id);
};

export const acceptedFiletypes = (has_subscription: boolean | undefined) => {
  if (has_subscription) {
    return [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "video/mp4",
      "video/webm",
      "video/quicktime",
    ];
  }

  return ["image/jpeg", "image/png", "image/jpg"];
};

export const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
};

export const getMaxFileSize = (has_subscription: boolean | undefined) => {
  if (has_subscription) return MAX_FILE_SIZE_PRO;
  return MAX_FILE_SIZE;
};

export const formatPrice = (itemPrice: number | undefined) => {
  if (!itemPrice) {
    return "$0.00";
  }
  const price = new Intl.NumberFormat("en-CA", {
    currency: "CAD",
    style: "currency",
  });

  return price.format(itemPrice / 100);
};

export const generateYears = () => {
  let year = new Date().getFullYear();
  const years = [];

  while (year >= 1980) {
    years.push(year--);
  }

  return years;
};

export const calculateModificationsCost = (
  mods: Modification[] | undefined
) => {
  if (!mods) return 0;

  let cost = 0;
  mods.forEach((m) => {
    if (!m.price) return;
    cost += Number(m.price);
  });
  return cost;
};
