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
import cuid2, { createId } from "@paralleldrive/cuid2";
import { X } from "lucide-react";
import mapboxgl from "mapbox-gl";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

interface Props {
  setShow: (x: boolean) => void;
  addingPoint: boolean;
  addPointHandler: () => void;
  map: React.MutableRefObject<mapboxgl.Map | null>;
  addDayHandler: (data: any) => void;
}

const DayForm = ({
  setShow,
  addingPoint,
  addPointHandler,
  addDayHandler,
}: Props) => {
  const mapStore = useMapStore();
  const form = useForm({
    resolver: zodResolver(daySchema),
    defaultValues: {
      day_number: "0",
      stops: {},
      notes: "",
    },
  });

  const stopWatch = form.watch("stops");

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

      form.setValue("stops", newPoints);
    }
  }, [mapStore.points]);

  const removeHandler = (id: string, point: Point) => {
    const l: any = form.getValues("stops");
    if (l[id]) {
      mapStore.removePoint(point);
      delete l[id];
    }
    form.setValue("stops", l);
  };

  return (
    <div className="p-4 rounded-md bg-card my-4">
      <header className="flex justify-between items-center">
        <H3 className="text-xl">Adding day...</H3>
        <button
          type="button"
          className="hover:bg-foreground hover:text-background h-10 w-10 rounded-full flex justify-center items-center transition-all"
          onClick={() => setShow(false)}
        >
          <X size={18} />
        </button>
      </header>

      <Form {...form}>
        <form
          className="flex flex-col gap-4"
          onSubmit={form.handleSubmit((data) => {
            form.reset();
            mapStore.clearPoints();
            addDayHandler(data);
          })}
        >
          <FormField
            name="day_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Day #</FormLabel>
                <FormDescription>
                  Which day number is this (eg: Day #1, Day #2, etc)
                </FormDescription>
                <Input type="number" min={0} step={1} {...field} />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormDescription>Add some notes about this day</FormDescription>
                <Textarea
                  placeholder="What did you do? How was the weather? Run into any problems?"
                  {...field}
                />
              </FormItem>
            )}
          />

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
              {Object.entries(stopWatch).map((key, index) => {
                const id = key[0];
                const point = key[1] as Point;

                return (
                  <FormField
                    key={id}
                    name={`stops.${id}.events`}
                    render={({ field }) => (
                      <FormItem className="border bg-background border-border p-4 rounded-lg">
                        <FormLabel>Stop #{index + 1}</FormLabel>
                        <FormDescription>
                          Add some notes about this stop
                        </FormDescription>
                        <Textarea
                          placeholder="What did you do? How was the weather? Run into any problems?"
                          {...field}
                        />
                        <Button
                          type="button"
                          className="p-0 m-0 h-fit text-sm text-red-500"
                          variant="link"
                          onClick={() => removeHandler(id, point)}
                        >
                          Remove stop
                        </Button>
                      </FormItem>
                    )}
                  />
                );
              })}
            </div>
          </div>
          <Separator />
          <Button>Save day</Button>
        </form>
      </Form>
    </div>
  );
};

export default DayForm;
