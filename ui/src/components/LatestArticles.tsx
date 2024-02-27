import React from "react";
import { Item } from "rss-parser";

const LatestArticles = ({
  articles,
}: {
  articles: ({ [key: string]: any } & Item)[] | undefined;
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-4 lg:p-0">
      {articles?.map((a) => (
        <div key={a.title}>
          <a href={a.link} target="_blank">
            <h3 className="font-bold text-xl text-foreground hover:text-primary underline">
              {a.title}
            </h3>
          </a>
          <p className="text-sm text-muted-foreground mt-4">
            {a.contentSnippet}
          </p>
        </div>
      ))}
    </div>
  );
};

export default LatestArticles;
