import React from "react";

const Vehicle = ({
  make,
  model,
  year,
}: {
  make?: string;
  model?: string;
  year?: string;
}) => {
  return (
    <p className="flex gap-2 capitalize">
      {make && <span className="text-muted-foreground">{make}</span>}
      {model && <span className="text-muted-foreground">{model}</span>}
      {year && <span className="text-muted-foreground font-light">{year}</span>}
    </p>
  );
};

export default Vehicle;
