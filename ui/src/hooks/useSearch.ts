import { request } from "@/lib/axios";
import { Build } from "@/types";
import axios from "axios";
import { useEffect, useState } from "react";

export const useSearch = () => {
  const [value, setValue] = useState<string>("");
  const [results, setResults] = useState<Build[] | "">("");

  useEffect(() => {
    const fn = async () => {
      if (value) {
        const data = await request.get<{ results: Build[] }>("/api/search", {
          params: {
            query: value,
          },
        });

        setResults(data.data.results);
      } else {
        setResults("");
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
