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
      {make && <span>{make}</span>}
      {model && <span>{model}</span>}
      {year && <span>{year}</span>}
    </p>
  );
};

export default Vehicle;
