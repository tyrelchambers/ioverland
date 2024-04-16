import { groupHistoryByYear } from "@/lib/utils";
import React from "react";
import EmptyListText from "../EmptyListText";
import { History as HistoryType } from "@/types";

const History = ({ history }: { history: HistoryType[] | undefined }) => {
  if (!history || history.length === 0)
    return <EmptyListText text="No build history" />;
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {Object.entries(groupHistoryByYear(history)).map(([year, data]) => {
        return (
          <div key={year} className="border-border border rounded-xl p-4">
            <p className="font-sans font-bold text-xl mb-6">{year}</p>
            <ul className="flex flex-col  gap-4">
              {data.map((d) => (
                <li
                  key={d.uuid}
                  className="flex justify-between odd:bg-card p-2 px-4 rounded-md items-center"
                >
                  <p className="font-medium">{d.event}</p>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
};

export default History;
