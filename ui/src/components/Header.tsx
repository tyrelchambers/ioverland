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
    <header className="header sticky top-0 p-4 transition-all flex items-center z-50">
      <h2 className="text-primary font-bold font-serif">iOverland</h2>
      <div className="flex gap-4 items-center ">
        <Link href={`/builds/me`}>
          <Button variant="link">My builds</Button>
        </Link>
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
          <Button>Sign up</Button>
        </SignedOut>
      </div>
    </header>
  );
};

export default Header;
