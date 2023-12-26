import { ExternalLink } from "lucide-react";
import React from "react";

const Links = ({ links }: { links: (string | undefined)[] | undefined }) => {
  if (!links) return null;

  return (
    <div className="flex flex-col gap-3">
      {links.map((link, id) => (
        <a
          href={link}
          key={link + "_" + id}
          className="border border-border rounded-xl p-3 flex gap-3 items-center hover:underline hover:text-blue-400"
          target="_blank"
        >
          <ExternalLink size={16} />
          <p className="truncate">{link}</p>
        </a>
      ))}
    </div>
  );
};

export default Links;
