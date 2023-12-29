import React from "react";

const EmptyListText = ({ text }: { text: string }) => {
  return (
    <div className="bg-muted rounded-xl p-4">
      <p className="italic text-muted-foreground">{text}</p>
    </div>
  );
};

export default EmptyListText;
