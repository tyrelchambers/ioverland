import React, { useCallback, useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { Layers, LocateFixed, MousePointerClick } from "lucide-react";
import { useCoords } from "@/hooks/useCoords";
import LayerModal from "./LayerModal";
import { useMapboxConfigStore } from "@/stores/useMapboxLayers";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import { cn, getMatch } from "@/lib/utils";
import { useMapStore } from "@/stores/mapStore";
import { createId } from "@paralleldrive/cuid2";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN as string;
const Map = ({
  addPointRef,
  map,
  setAddingPoint,
}: {
  addPointRef: React.MutableRefObject<boolean>;
  map: React.MutableRefObject<mapboxgl.Map | null>;
  setAddingPoint: (x: boolean) => void;
}) => {
  const mapContainer = useRef<any>("");
  const [lng, setLng] = useState(-70.9);
  const [lat, setLat] = useState(42.35);
  const [zoom, setZoom] = useState(9);
  const coords = useCoords();
  const mapboxConfig = useMapboxConfigStore();
  const mapStore = useMapStore();

  useEffect(() => {
    if (map.current) return; // initialize map only once
    const mapInit = new mapboxgl.Map({
      container: mapContainer.current,
      style: mapboxConfig.config.style,
      center: [lng, lat],
      zoom: zoom,
    });

    map.current = mapInit;

    mapInit.on("move", () => {
      setLng(Number(mapInit.getCenter().lng.toFixed(4)));
      setLat(Number(mapInit.getCenter().lat.toFixed(4)));
      setZoom(Number(mapInit.getZoom().toFixed(2)));
    });

    map.current.on("load", () => {
      if (!map.current) return;

      map.current.on("click", (ev) => {
        if (!addPointRef.current) {
          return;
        }

        mapStore.addPoint({
          id: createId(),
          lat: ev.lngLat.lat,
          lng: ev.lngLat.lng,
        });
        setAddingPoint(false);
      });
    });
  });

  useEffect(() => {
    if (!map.current) return;
    map.current.setStyle(mapboxConfig.config.style);
  }, [mapboxConfig.config]);

  const centerMap = () => {
    if (!map.current) return;

    map.current.flyTo({
      center: [coords?.long ?? 0, coords?.lat ?? 0],
      zoom: 15,
    });
  };

  return (
    <div className="w-[calc(100vw-500px)] flex justify-end relative">
      <div className="absolute top-4 left-3 z-20 flex flex-col rounded-full bg-white shadow-lg p-3">
        <p className="text-xs text-muted-foreground">
          Long: <span className="font-bold">{lng}</span> Lat:{" "}
          <span className="font-bold">{lat}</span>
        </p>
      </div>
      <div className="absolute top-1/2 right-3 z-20 flex flex-col  rounded-full bg-white shadow-lg">
        <LayerModal />
        <button
          className="rounded-full p-3 text-gray-700 hover:bg-gray-200"
          type="button"
          onClick={centerMap}
        >
          <LocateFixed />
        </button>
      </div>
      <div ref={mapContainer} className="map-container h-screen w-full" />
    </div>
  );
};

export default Map;
