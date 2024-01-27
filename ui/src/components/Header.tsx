import React, { useEffect } from "react";
import { cn } from "@/lib/utils";
import { BadgeDollarSign, Home, LayoutDashboard, Mountain } from "lucide-react";
import { useSearch } from "@/hooks/useSearch";
import MobileNav from "./header/MobileNav";
import Search from "./header/Search";
import MobileSearch from "./header/MobileSearch";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Badge } from "./ui/badge";
import Link from "next/link";
import { Button } from "./ui/button";
import { useViewportWidth } from "@/hooks/useViewportWidth";

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
  const [searchValue, setSearchValue] = React.useState("");
  const { search } = useSearch(searchValue);
  const { width } = useViewportWidth();
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
        <Link href="/">
          <h2 className="text-foreground font-bold font-serif flex items-center gap-3">
            iOverland <Badge>Beta</Badge>
          </h2>
        </Link>
        {/* this is the mobile nav */}
        <div className="gap-4 flex lg:hidden">
          <UserButton afterSignOutUrl="/" />

          <MobileSearch
            searchResults={search.data ?? []}
            setSearchValue={setSearchValue}
            searchValue={searchValue}
            isLoading={search.isFetching}
          />

          <MobileNav routes={routes} authRoutes={authRoutes} />
        </div>

        {/* this is the desktop nav */}
        {width >= 1024 && (
          <div className="flex items-center gap-4">
            <Search
              searchResults={search.data ?? []}
              searchValue={searchValue}
              setSearchValue={setSearchValue}
              isLoading={search.isFetching}
            />
            <div className="gap-8 items-center hidden lg:flex">
              {routes.map((route) => (
                <Link
                  href={route.href}
                  key={route.label}
                  className="flex gap-3 items-center  hover:text-primary text-foreground/50"
                >
                  {route.label}
                </Link>
              ))}
              <SignedIn>
                {authRoutes.map((route) => (
                  <Link
                    href={route.href}
                    key={route.label}
                    className="flex gap-3 items-center  hover:text-primary text-foreground/50"
                  >
                    {route.label}
                  </Link>
                ))}
                <Link href="/build/new">
                  <Button size="sm">New build</Button>
                </Link>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
              <SignedOut>
                <Link href="/sign-up">
                  <Button>Sign up</Button>
                </Link>
              </SignedOut>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
