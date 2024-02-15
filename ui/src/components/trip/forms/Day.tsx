import { H3 } from "@/components/Heading";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useMapStore } from "@/stores/mapStore";
import { Point, Stop, daySchema } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { createId } from "@paralleldrive/cuid2";
import mapboxgl from "mapbox-gl";
import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import Map from "../Map";

interface Props {
  addDayHandler: (data: any) => void;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const DayForm = ({ addDayHandler, setOpen }: Props) => {
  const mapStore = useMapStore();
  const map = useRef<mapboxgl.Map | null>(null);
  const [addingPoint, setAddingPoint] = useState(false);
  const addPointRef = useRef(addingPoint);

  const [data, setData] = useState({
    day_number: 0,
    notes: "",
  });
  const [stops, setStops] = useState({});

  useEffect(() => {
    if (mapStore.points.length > 0) {
      const newPoints: {
        [key: string]: Stop;
      } = {};

      for (let i = 0; i < mapStore.points.length; i++) {
        const element = mapStore.points[i];

        newPoints[createId()] = {
          lat: element.lat,
          lng: element.lng,
          events: "",
        };
      }

      setStops(newPoints);
    }
  }, [mapStore.points]);

  const removeHandler = (id: string, point: Point) => {
    const l: any = stops;
    if (l[id]) {
      mapStore.removePoint(point);
      delete l[id];
    }

    setStops(l);
  };

  const addPointHandler = () => {
    setAddingPoint(!addingPoint);
    addPointRef.current = !addingPoint;
  };

  return (
    <div className="flex gap-4">
      <div className="flex flex-col gap-4 p-2">
        <FormItem>
          <FormLabel>Day #</FormLabel>
          <FormDescription>
            Which day number is this (eg: Day #1, Day #2, etc)
          </FormDescription>
          <Input
            type="number"
            min={0}
            step={1}
            defaultValue="0"
            value={data.day_number}
            onChange={(e) =>
              setData({ ...data, day_number: Number(e.target.value) })
            }
          />
          <FormMessage />
        </FormItem>

        <FormItem>
          <FormLabel>Notes</FormLabel>
          <FormDescription>Add some notes about this day</FormDescription>
          <Textarea
            placeholder="What did you do? How was the weather? Run into any problems?"
            value={data.notes}
            onChange={(e) => setData({ ...data, notes: e.target.value })}
          />
        </FormItem>

        <div>
          <Label>Add a stop</Label>
          <FormDescription>
            Add a stop/waypoint to the map to detail what you did at that
            location (eg: sleept, eat, etc)
          </FormDescription>
          <Button
            type="button"
            variant={addingPoint ? "default" : "secondary"}
            className="w-full mt-2"
            onClick={addPointHandler}
          >
            {addingPoint ? "Click on map to add point..." : "Add Point"}
          </Button>
        </div>
        <Separator />

        <div>
          <Label>Stops</Label>
          <FormDescription>Stops currently added to the nap.</FormDescription>

          <div className="flex flex-col gap-4 mt-6">
            {Object.entries(stops).map((key, index) => {
              const id = key[0];
              const point = key[1] as Point;

              return (
                <FormItem
                  key={id}
                  className="border bg-card border-border p-4 rounded-lg"
                >
                  <FormLabel>Stop #{index + 1}</FormLabel>
                  <FormDescription>
                    Add some notes about this stop
                  </FormDescription>
                  <Textarea placeholder="What did you do? How was the weather? Run into any problems?" />
                  <Button
                    type="button"
                    className="p-0 m-0 h-fit text-sm text-red-500"
                    variant="link"
                    onClick={() => removeHandler(id, point)}
                  >
                    Remove stop
                  </Button>
                </FormItem>
              );
            })}
          </div>
        </div>
        <Separator />
        <Button
          onClick={() => {
            setData({
              day_number: 0,
              notes: "",
            });
            setStops({});
            mapStore.clearPoints();
            addDayHandler(data);
          }}
        >
          Save day
        </Button>
      </div>
      <Map
        addPointRef={addPointRef}
        map={map}
        setAddingPoint={setAddingPoint}
      />
    </div>
  );
};

export default DayForm;
