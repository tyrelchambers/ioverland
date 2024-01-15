import {
  Bookmark,
  Fingerprint,
  Grid2x2,
  LucideIcon,
  Sparkle,
  User,
} from "lucide-react";

interface Tab {
  tab: string;
  icon: LucideIcon;
  label: string;
}

export const dashboardTabs: Tab[] = [
  {
    tab: "builds",
    icon: Grid2x2,
    label: "Builds",
  },
  {
    tab: "bookmarks",
    icon: Bookmark,
    label: "Bookmarks",
  },
  {
    tab: "account",
    icon: Fingerprint,
    label: "Account",
  },
  {
    tab: "profile",
    icon: User,
    label: "Profile",
  },
  {
    tab: "following",
    icon: Sparkle,
    label: "Following",
  },
  {
    tab: "followers",
    icon: Sparkle,
    label: "Followers",
  },
];
