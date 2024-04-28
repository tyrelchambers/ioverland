import {
  Bookmark,
  Fingerprint,
  FlameKindling,
  Grid2x2,
  LucideIcon,
  Sparkle,
  User,
  BadgeDollarSign,
  Home,
  LayoutDashboard,
  Map,
  Mountain,
  Plus,
  PlusCircle,
  Rss,
  Wrench,
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
    tab: "adventures",
    icon: FlameKindling,
    label: "Adventures",
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

export const routes = [
  {
    href: "/",
    label: "Home",
    icon: <Home size={20} />,
  },
  {
    href: "/explore",
    label: "Explore",
    icon: <Mountain size={20} />,
  },
  {
    href: "/pricing",
    label: "Pricing",
    icon: <BadgeDollarSign size={20} />,
  },
  {
    href: "/blog",
    label: "Blog",
    icon: <Rss size={20} />,
    external: {
      href: "https://blog.wildbarrens.com",
    },
  },
];

export const authRoutes = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard size={20} />,
  },
];
