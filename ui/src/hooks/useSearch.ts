import { request } from "@/lib/axios";
import { Build, ClerkUser } from "@/types";
import { User } from "@clerk/nextjs/server";
import axios from "axios";
import { useEffect, useState } from "react";

export const useSearch = () => {
  const [value, setValue] = useState<string>("");
  const [results, setResults] = useState<Build[] | ClerkUser[]>([]);

  useEffect(() => {
    const fn = async () => {
      if (value) {
        const data = await request.get<Build[] | ClerkUser[]>("/api/search", {
          params: {
            query: value,
          },
        });

        setResults(data.data);
      } else {
        setResults([]);
      }
    };

    fn();
  }, [value]);

  const searchHandler = (query: string) => {
    setValue(query);
  };

  return {
    searchValue: value,
    search: searchHandler,
    results,
  };
};
