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
  searchValue: string;
  search: (value: string) => void;
  results: Build[] | ClerkUser[];
}

const MobileSearch = ({ searchValue, search, results }: Props) => {
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
          value={searchValue}
          onChange={(e) => search(e.target.value)}
        />
        <ScrollArea className="max-h-[200px] h-full flex flex-col gap-3">
          <div className="flex flex-col gap-3">
            {results &&
              results?.map((res, id) => <SearchItem res={res} key={id} />)}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default MobileSearch;
