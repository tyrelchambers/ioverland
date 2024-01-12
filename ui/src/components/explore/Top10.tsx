import React from "react";
import { H2 } from "../Heading";
import BuildItem from "../BuildItem";
import { Build } from "@/types";

const Top10 = ({ top10 }: { top10: Build[] | undefined }) => {
  return (
    <section className="bg-card w-full">
      <div className="max-w-screen-xl mx-auto my-10 p-10">
        <H2>Top 10 Builds</H2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-12">
          {top10?.map((build, index) => (
            <BuildItem build={build} key={build.uuid + "_" + index} playVideo />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Top10;
