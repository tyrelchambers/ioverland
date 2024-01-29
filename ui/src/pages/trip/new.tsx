import { H1, H2 } from "@/components/Heading";
import Uploader from "@/components/Uploader";
import AddWaypoint from "@/components/trip/AddWaypoint";
import Map from "@/components/trip/Map";
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
import { useDomainUser } from "@/hooks/useDomainUser";
import { generateYears } from "@/lib/utils";
import { newTripSchema } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { FilePondFile } from "filepond";
import { FormInput } from "lucide-react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";

const NewTrip = () => {
  const { account, user } = useDomainUser();
  const [photos, setPhotos] = useState<FilePondFile[]>([]);

  const builds = user.data?.builds;

  const form = useForm({
    resolver: zodResolver(newTripSchema),
    defaultValues: {
      name: "",
      summary: "",
      year: "",
      builds: {},
      waypoints: {},
    },
  });

  return (
    <section className="h-screen w-full flex overflow-hidden">
      <header className="w-[500px] h-full p-4 z-10 relative bg-white overflow-y-auto">
        <div>
          <H1 className="text-xl">Create a trip</H1>
          <p className="text-muted-foreground">
            Fill out some details for your trip and then you can attach it to a
            build if you would like.
          </p>
        </div>

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
                  <FormLabel>Notes</FormLabel>
                  <Textarea placeholder="Notes" {...field} />
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
                maxFiles={account.data?.plan_limits.adventure_num_photos}
                maxFileSize={account.data?.plan_limits.max_file_size}
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
              <H2 className="text-xl !mb-0">Waypoints</H2>
              <p className="text-muted-foreground">
                Place a waypoint on the map to edit its info.
              </p>
            </div>
          </form>
        </Form>
      </header>
      <Map />
    </section>
  );
};

export default NewTrip;
