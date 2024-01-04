import Link from "next/link";
import React, { useEffect } from "react";
import { Button } from "./ui/button";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { useViewportWidth } from "@/hooks/useViewportWidth";
import { Sheet, SheetContent, SheetHeader, SheetTrigger } from "./ui/sheet";
import { Home, LayoutDashboard, Mountain } from "lucide-react";

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
}

const Header = ({ on, className }: Props) => {
  const { width } = useViewportWidth();

  useEffect(() => {
    const header = document.querySelector(".header");

    if (header) {
      document.addEventListener("scroll", () => {
        if (window.scrollY > 0) {
          header.classList.add("header-scrolled");
        } else {
          header.classList.remove("header-scrolled");
        }
      });
    }
  }, []);

  return (
    <header
      className={cn(
        "header sticky top-0 p-4 bg-background transition-all flex items-center z-50 border-b border-border",
        className
      )}
    >
      <h2 className="text-foreground font-bold font-serif">iOverland</h2>
      {width <= 768 ? (
        <Sheet>
          <SheetTrigger>
            <div className="w-[20px] h-[15px] flex flex-col gap-1">
              <span className="w-full h-[2px] bg-foreground"></span>
              <span className="w-full h-[2px] bg-foreground"></span>
              <span className="w-1/2 h-[2px] bg-foreground"></span>
            </div>
          </SheetTrigger>
          <SheetContent>
            <div className="flex flex-col gap-8 mt-10">
              {routes.map((route) => (
                <Link
                  href={route.href}
                  key={route.label}
                  className="flex gap-6 items-center underline hover:text-primary"
                >
                  {route.icon} {route.label}
                </Link>
              ))}
              {authRoutes.map((route) => (
                <Link
                  href={route.href}
                  key={route.label}
                  className="flex gap-6 items-center underline hover:text-primary"
                >
                  {route.icon} {route.label}
                </Link>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      ) : (
        <div className="flex gap-8 items-center ">
          {routes.map((route) => (
            <Link
              href={`/explore`}
              key={route.label}
              className="flex gap-3 items-center  hover:text-primary text-foreground/50 hover:text-foreground"
            >
              {route.label}
            </Link>
          ))}
          {authRoutes.map((route) => (
            <Link
              href={route.href}
              key={route.label}
              className="flex gap-3 items-center  hover:text-primary text-foreground/50 hover:text-foreground"
            >
              {route.label}
            </Link>
          ))}
          <SignedIn>
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
      )}
    </header>
  );
};

export default Header;
