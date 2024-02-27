import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Parser from "rss-parser";
const parser = new Parser();
export const useBlog = () => {
  const query = useQuery({
    queryKey: ["blog"],
    queryFn: async () => {
      const data = parser.parseURL("http://localhost:4321/rss.xml");
      return data;
    },
  });

  return {
    blog: query,
  };
};
