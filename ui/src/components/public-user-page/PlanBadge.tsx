import React from "react";

const PlanBadge = ({ plan }: { plan: string | undefined }) => {
  if (plan === "Overlander") {
    return (
      <div className="mt-3 mb-3 bg-gradient-to-tr from-orange-600 to-orange-300 rounded-full py-1 px-5">
        <p className="text-sm font-bold text-white">{plan}</p>
      </div>
    );
  } else if (plan === "Explorer") {
    return (
      <div className="mt-3 mb-3 bg-gradient-to-tr from-gray-600 to-gray-300 rounded-full py-1 px-5">
        <p className="text-sm font-bold text-white">{plan}</p>
      </div>
    );
  }

  return null;
};

export default PlanBadge;
