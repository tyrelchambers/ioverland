import React from "react";

const EmptyListText = ({ text }: { text: string }) => {
  return (
    <div className="bg-card rounded-xl p-4">
      <p className="italic text-card-foreground">{text}</p>
    </div>
  );
};

export default EmptyListText;
