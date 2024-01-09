import Link from "next/link";
import React, { useEffect } from "react";
import { Button } from "./ui/button";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { useViewportWidth } from "@/hooks/useViewportWidth";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { Home, LayoutDashboard, Mountain, Search } from "lucide-react";
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

const routes = [
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
];

const authRoutes = [
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
  const { width } = useViewportWidth();
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
          <Dialog>
            <DialogTrigger>
              <Search className="text-foreground" />
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>Search</DialogTitle>
                <DialogDescription>
                  Search for a build by its name.
                </DialogDescription>
              </DialogHeader>
              <Input
                type="search"
                placeholder="Search for a build"
                className="w-full"
                value={searchValue}
                onChange={(e) => search(e.target.value)}
              />
              <div className="flex flex-col gap-3">
                {results &&
                  results?.map((build) => (
                    <Link key={build.uuid} href={`/build/${build.uuid}`}>
                      <div className="flex gap-3 items-center">
                        <div className="relative h-auto w-[100px]">
                          <RenderMedia media={build.banner} />
                        </div>
                        <p className="font-bold">{build.name}</p>
                        <p>{}</p>
                      </div>
                    </Link>
                  ))}
              </div>
            </DialogContent>
          </Dialog>
          <MobileNav routes={routes} authRoutes={authRoutes} />
        </div>

        {/* this is the desktop nav */}
        <div className="gap-8 items-center hidden lg:flex">
          <Popover open={searchValue !== "" && width > 768}>
            <PopoverTrigger>
              <Input
                type="search"
                placeholder="Search for a build"
                className="w-[400px]"
                value={searchValue}
                onChange={(e) => search(e.target.value)}
              />

              <PopoverContent
                className="w-[400px]"
                onOpenAutoFocus={(e) => e.preventDefault()}
                onCloseAutoFocus={(e) => e.preventDefault()}
              >
                <div className="flex flex-col gap-3">
                  {results &&
                    results?.map((build) => (
                      <Link key={build.uuid} href={`/build/${build.uuid}`}>
                        <div className="flex gap-3 items-center">
                          <div className="relative h-auto w-[100px]">
                            <RenderMedia media={build.banner} />
                          </div>
                          <p className="font-bold">{build.name}</p>
                          <p>{}</p>
                        </div>
                      </Link>
                    ))}

                  {results?.length === 0 && (
                    <p className="text-muted-foreground">
                      Can&apos;t find any builds with the name{" "}
                      <span className="font-bold text-foreground">
                        {searchValue}
                      </span>
                    </p>
                  )}
                </div>
              </PopoverContent>
            </PopoverTrigger>
          </Popover>
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
              <Button
                size="sm"
                className={cn({
                  "text-primary-foreground bg-primary": on === "dark",
                })}
              >
                New build
              </Button>
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
    </header>
  );
};

export default Header;
