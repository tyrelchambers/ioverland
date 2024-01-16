import React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { useViewportWidth } from "@/hooks/useViewportWidth";
import { Input } from "../ui/input";
import Link from "next/link";
import { authRoutes, routes } from "../Header";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Button } from "../ui/button";
import { Build, ClerkUser } from "@/types";
import SearchItem from "./SearchItem";
import { ScrollArea } from "../ui/scroll-area";

interface Props {
  searchValue: string;
  setSearchValue: (value: string) => void;
  searchResults: Build[] | ClerkUser[];
  isLoading: boolean;
}
const Search = ({
  searchValue,
  setSearchValue,
  searchResults,
  isLoading,
}: Props) => {
  const { width } = useViewportWidth();

  console.log(searchResults);

  return (
    <div className="gap-8 items-center hidden lg:flex">
      <Popover open={searchValue !== "" && width > 768}>
        <PopoverTrigger>
          <Input
            type="search"
            placeholder="Search for a build"
            className="w-[400px]"
            onChange={(e) => setSearchValue(e.target.value)}
          />

          <PopoverContent
            className="w-[400px]"
            onOpenAutoFocus={(e) => e.preventDefault()}
            onCloseAutoFocus={(e) => e.preventDefault()}
          >
            <ScrollArea className="max-h-[400px] h-full flex flex-col gap-3">
              <div className="flex flex-col gap-3">
                {searchResults &&
                  searchResults?.map((res, id) => (
                    <SearchItem res={res} key={id} />
                  ))}

                {!isLoading && searchResults?.length === 0 && (
                  <p className="text-muted-foreground">
                    Can&apos;t find anything with the name{" "}
                    <span className="font-bold text-foreground">
                      {searchValue}
                    </span>
                  </p>
                )}
              </div>
            </ScrollArea>
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
  );
};

export default Search;
