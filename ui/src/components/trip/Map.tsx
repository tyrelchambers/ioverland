import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { Layers, LocateFixed, MousePointerClick } from "lucide-react";
import { useCoords } from "@/hooks/useCoords";
import LayerModal from "./LayerModal";
import { useMapboxConfigStore } from "@/stores/useMapboxLayers";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import { cn, getMatch } from "@/lib/utils";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN as string;
const Map = () => {
  const mapContainer = useRef<any>("");
  const map = useRef<mapboxgl.Map | null>(null);
  const [lng, setLng] = useState(-70.9);
  const [lat, setLat] = useState(42.35);
  const [zoom, setZoom] = useState(9);
  const coords = useCoords();
  const mapboxConfig = useMapboxConfigStore();
  const Draw = useRef<MapboxDraw | null>(null);
  const [mapRoutes, setMapRoutes] = useState([]);

  useEffect(() => {
    if (map.current) return; // initialize map only once
    const mapInit = new mapboxgl.Map({
      container: mapContainer.current,
      style: mapboxConfig.config.style,
      center: [lng, lat],
      zoom: zoom,
    });

    map.current = mapInit;

    var draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        point: true,
      },
      styles: [
        // ACTIVE (being drawn)
        // line stroke
        {
          id: "gl-draw-line",
          type: "line",
          filter: [
            "all",
            ["==", "$type", "LineString"],
            ["!=", "mode", "static"],
          ],
          layout: {
            "line-cap": "round",
            "line-join": "round",
          },
          paint: {
            "line-color": "#3b9ddd",
            "line-dasharray": [0.2, 2],
            "line-width": 4,
            "line-opacity": 0.7,
          },
        },
        // vertex point halos
        {
          id: "gl-draw-polygon-and-line-vertex-halo-active",
          type: "circle",
          filter: [
            "all",
            ["==", "meta", "vertex"],
            ["==", "$type", "Point"],
            ["!=", "mode", "static"],
          ],
          paint: {
            "circle-radius": 10,
            "circle-color": "#FFF",
          },
        },
        // vertex points
        {
          id: "gl-draw-polygon-and-line-vertex-active",
          type: "circle",
          filter: [
            "all",
            ["==", "meta", "vertex"],
            ["==", "$type", "Point"],
            ["!=", "mode", "static"],
          ],
          paint: {
            "circle-radius": 6,
            "circle-color": "#3b9ddd",
          },
        },
      ],
    });

    if (draw) {
      mapInit.addControl(draw, "top-right");
      Draw.current = draw;
    }
    mapInit.on("draw.create", updateRoute);
    mapInit.on("draw.update", updateRoute);
    mapInit.on("move", () => {
      setLng(Number(mapInit.getCenter().lng.toFixed(4)));
      setLat(Number(mapInit.getCenter().lat.toFixed(4)));
      setZoom(Number(mapInit.getZoom().toFixed(2)));
    });

    map.current.on("click", (ev) => {
      console.log(ev);

      new mapboxgl.Popup({ offset: [0, -15] })
        .setLngLat(ev.lngLat)
        .setHTML(
          `<h3>${feature.properties.title}</h3><p>${feature.properties.description}</p>`
        )
        .addTo(map);
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

  async function updateRoute() {
    const data = Draw.current.getAll();
    const lastFeature = data.features.length - 1;
    const _coords = data.features[lastFeature].geometry.coordinates;
    const newCoords = _coords.join(";");
    const _match = await getMatch(newCoords);
    const featureId = data.features[lastFeature].id;

    const match = {
      ..._match,
      featureId,
    };

    console.log(match);
  }

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
