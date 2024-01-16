import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { SearchIcon } from "lucide-react";
import { Input } from "../ui/input";
import { Build, ClerkUser } from "@/types";
import SearchItem from "./SearchItem";
import { ScrollArea } from "../ui/scroll-area";

interface Props {
  searchResults: Build[] | ClerkUser[];
  setSearchValue: (value: string) => void;
  searchValue: string;
  isLoading: boolean;
}

const MobileSearch = ({
  searchResults,
  setSearchValue,
  searchValue,
  isLoading,
}: Props) => {
  return (
    <Dialog>
      <DialogTrigger>
        <SearchIcon className="text-foreground" />
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Search</DialogTitle>
          <DialogDescription>Search for a build by its name.</DialogDescription>
        </DialogHeader>
        <Input
          type="search"
          placeholder="Search for a build"
          className="w-full"
          onChange={(e) => setSearchValue(e.target.value)}
        />
        <ScrollArea className="max-h-[200px] h-full flex flex-col gap-3">
          <div className="flex flex-col gap-3">
            {searchResults &&
              searchResults?.map((res, id) => (
                <SearchItem res={res} key={id} />
              ))}

            {!isLoading && searchValue && searchResults?.length === 0 && (
              <p className="text-muted-foreground">
                Can&apos;t find anything with the name{" "}
                <span className="font-bold text-foreground">{searchValue}</span>
              </p>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default MobileSearch;
