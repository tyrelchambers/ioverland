import Link from "next/link";
import React, { useEffect } from "react";
import { Button } from "./ui/button";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { cn } from "@/lib/utils";

interface Props {
  on?: "dark" | "light";
}

const Header = ({ on }: Props) => {
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
    <header className="header sticky top-0 p-4 bg-background transition-all flex items-center z-50 border-b border-border">
      <h2 className="text-foreground font-bold font-serif">iOverland</h2>
      <div className="flex gap-4 items-center ">
        <SignedIn>
          <Link href={`/explore`}>
            <Button variant="link">Explore</Button>
          </Link>
          <Link href={`/dashboard`}>
            <Button variant="link">Dashboard</Button>
          </Link>
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
    </header>
  );
};

export default Header;
