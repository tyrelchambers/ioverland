import { useEffect, useState } from "react";

export const useCoords = () => {
  const [coords, setCoords] = useState<{ long: number; lat: number }>();
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      const geo = {
        long: coords.longitude,
        lat: coords.latitude,
      };

      setCoords(geo);
    });
  }, []);

  return coords;
};
