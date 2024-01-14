import Link from "next/link";
import React, { useEffect } from "react";
import { Button } from "./ui/button";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { useViewportWidth } from "@/hooks/useViewportWidth";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import {
  BadgeDollarSign,
  Home,
  LayoutDashboard,
  Mountain,
  Search as SearchIcon,
} from "lucide-react";
import { Input } from "./ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { useSearch } from "@/hooks/useSearch";
import Image from "next/image";
import RenderMedia from "./RenderMedia";
import MobileNav from "./header/MobileNav";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import Search from "./header/Search";
import MobileSearch from "./header/MobileSearch";

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
];

export const authRoutes = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard size={20} />,
  },
];

interface Props {
  on?: "dark" | "light";
  className?: string;
  stickyOnScroll?: boolean;
}

const Header = ({ on, className, stickyOnScroll }: Props) => {
  const { searchValue, search, results } = useSearch();

  useEffect(() => {
    const header = document.querySelector(".header");
    const body = document.querySelector("body");
    if (header && body && stickyOnScroll) {
      document.addEventListener("scroll", () => {
        if (window.scrollY > 0) {
          header.classList.add("header-scrolled");
          body.style.paddingTop = "69px";
        } else {
          header.classList.remove("header-scrolled");
          body.style.paddingTop = "0px";
        }
      });
    }
  }, []);

  return (
    <header
      className={cn(
        "header sticky top-0 p-4 bg-background transition-all z-50 border-b border-border",
        className
      )}
    >
      <div className="max-w-screen-2xl mx-auto flex items-center justify-between w-full">
        <h2 className="text-foreground font-bold font-serif">iOverland</h2>
        {/* this is the mobile nav */}
        <div className="gap-8 flex lg:hidden">
          <MobileSearch
            searchValue={searchValue}
            search={search}
            results={results}
          />
          <MobileNav routes={routes} authRoutes={authRoutes} />
        </div>

        {/* this is the desktop nav */}
        <Search searchValue={searchValue} search={search} results={results} />
      </div>
    </header>
  );
};

export default Header;
