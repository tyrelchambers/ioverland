import React, { useEffect } from "react";
import { cn } from "@/lib/utils";
import {
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
import { useSearch } from "@/hooks/useSearch";
import MobileNav from "./header/MobileNav";
import Search from "./header/Search";
import MobileSearch from "./header/MobileSearch";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Badge } from "./ui/badge";
import Link from "next/link";
import { Button } from "./ui/button";
import { useViewportWidth } from "@/hooks/useViewportWidth";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "./ui/navigation-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { authRoutes, routes } from "@/index.routes";

interface Props {
  on?: "dark" | "light";
  className?: string;
  stickyOnScroll?: boolean;
}

const Header = ({ className, stickyOnScroll }: Props) => {
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
            WildBarrens <Badge>Beta</Badge>
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

          <MobileNav routes={routes} />
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
              {routes.map((route) =>
                route.external ? (
                  <a
                    href={route.external.href}
                    key={route.label}
                    className="flex gap-3 items-center  hover:text-primary text-foreground/50"
                  >
                    {route.label}
                  </a>
                ) : (
                  <Link
                    href={route.href}
                    key={route.label}
                    className="flex gap-3 items-center  hover:text-primary text-foreground/50"
                  >
                    {route.label}
                  </Link>
                )
              )}
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

                <DropdownMenu>
                  <DropdownMenuTrigger className="bg-primary flex items-center px-4 py-2 rounded-lg">
                    <PlusCircle size={16} className="mr-2" /> New
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <div className="w-[200px] flex flex-col">
                      <Link href="/build/new">
                        <DropdownMenuItem className="hover:bg-zinc-100 transition-all rounded-md flex gap-2 items-center text-muted-foreground">
                          <Wrench size={16} />
                          New build
                        </DropdownMenuItem>
                      </Link>
                      <Link href="/adventure/new">
                        <DropdownMenuItem className="hover:bg-zinc-100 transition-all rounded-md flex gap-2 items-center text-muted-foreground">
                          <Map size={16} />
                          New adventure
                        </DropdownMenuItem>
                      </Link>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
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
