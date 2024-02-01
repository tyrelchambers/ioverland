import { H2 } from "@/components/Heading";
import Uploader from "@/components/Uploader";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { generateYears } from "@/lib/utils";
import { Account, Build, Day } from "@/types";
import { FilePondFile } from "filepond";
import { TentTree } from "lucide-react";
import React from "react";

const General = ({
  form,
  builds,
  account,
  setPhotos,
  setShowAddDayForm,
}: {
  form: any;
  builds: Build[] | undefined;
  account: Account | undefined;
  setPhotos: (x: FilePondFile[]) => void;
  setShowAddDayForm: (x: boolean) => void;
}) => {
  const daysWatch = form.watch("days");

  const removeDayHandler = (id: string) => {
    const clone = form.getValues("days");
    if (clone[id]) {
      delete clone[id];
      form.setValue("days", clone);
    }
  };

  return (
    <Form {...form}>
      <form className="mt-6 flex flex-col gap-4 h-full ">
        <FormField
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <Input placeholder="The name of your trip" {...field} />
            </FormItem>
          )}
        />

        <FormField
          name="summary"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Summary</FormLabel>
              <Textarea
                placeholder="Add details about your trip here"
                {...field}
              />
            </FormItem>
          )}
        />

        <FormField
          name="year"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Year</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a year" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {generateYears().map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <FormItem>
          <FormLabel>Photos</FormLabel>
          <Uploader
            type="trip"
            allowMultiple
            maxFiles={account?.plan_limits.adventure_num_photos}
            maxFileSize={account?.plan_limits.max_file_size}
            onUpdate={setPhotos}
          />
        </FormItem>

        <FormItem>
          <FormLabel>Select your builds</FormLabel>
          <FormDescription>
            Were any of your builds a part of this trip?
          </FormDescription>
          <Select>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select a build" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {builds?.map((build) => (
                <SelectItem key={build.id} value={build.id as string}>
                  {build.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormItem>

        <Separator className="my-6" />
        <div className="flex flex-col">
          <H2 className="text-xl !mb-0">Days</H2>
          <p className="text-muted-foreground">
            Add a day to your trip. You can specify where you stayed, what you
            did, etc.
          </p>
          <Button
            variant="outline"
            className="mt-3"
            type="button"
            onClick={() => setShowAddDayForm(true)}
          >
            Add day
          </Button>

          <div className="mt-3">
            {Object.entries(daysWatch).map((input) => {
              const id = input[0];
              const day = input[1] as Day;

              return (
                <div
                  key={id}
                  className="border border-border p-4 rounded-md flex flex-col gap-2"
                >
                  <p className="font-bold">Day {day.day_number}</p>
                  {day.notes && <p>{day.notes}</p>}
                  {day.stops && (
                    <div>
                      {Object.entries(day.stops).map((stop) => {
                        const stopId = stop[0];
                        const stopData = stop[1];

                        return (
                          <div key={stopId}>
                            <p className="text-sm text-muted-foreground flex items-baseline gap-2">
                              <TentTree size={18} /> {stopData.lat.toFixed(2)},{" "}
                              {stopData.lng.toFixed(2)}
                            </p>
                            <p>{stopData.events}</p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  <Button
                    type="button"
                    variant="link"
                    className="w-fit p-0 m-0 text-red-500 self-end"
                    onClick={() => removeDayHandler(id)}
                  >
                    Remove day
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      </form>
    </Form>
  );
};

export default General;
