import Header from "@/components/Header";
import { H1 } from "@/components/Heading";
import { MaxFileSizeText } from "@/components/MaxFileSize";
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
import { Textarea } from "@/components/ui/textarea";
import { useAdventure } from "@/hooks/useAdventure";
import { useDomainUser } from "@/hooks/useDomainUser";
import { convertToArray, generateYears } from "@/lib/utils";
import {
  Build,
  Day,
  Media,
  NewTripPayload,
  daySchema,
  newTripSchema,
} from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { createId } from "@paralleldrive/cuid2";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { FilePondFile } from "filepond";
import { Loader2 } from "lucide-react";
import React, { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { folderRoot } from "@/constants";
import { Label } from "@/components/ui/label";
import ChooseBuild from "@/components/trip/ChooseBuild";
import RenderMedia from "@/components/RenderMedia";
import Info from "@/components/Info";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";

const NewTrip = () => {
  const { account, user } = useDomainUser();
  const [photos, setPhotos] = useState<FilePondFile[]>([]);
  const { create } = useAdventure();
  const builds = user.data?.builds;
  const [open, setOpen] = useState(false);

  const map = useRef<mapboxgl.Map | null>(null);

  const form = useForm({
    resolver: zodResolver(newTripSchema),
    defaultValues: {
      name: "",
      summary: "",
      year: "",
      builds: [],
      days: {},
      public: false,
    },
    disabled: account.data?.plan_limits.can_create_adventures === false,
  });

  const daysWatch = form.watch("days");
  const buildsWatch: Build[] = form.watch("builds");
  const removeDayHandler = (id: string) => {
    const clone: Record<string, Day> = form.getValues("days");
    if (clone[id]) {
      delete clone[id];
      form.setValue("days", clone);
    }
  };

  const addDayHandler = (data: z.infer<typeof daySchema>) => {
    const newDay: Record<string, Day> = {
      [createId()]: data,
    };
    form.setValue("days", { ...form.getValues("days"), ...newDay });
  };

  const submitHandler = async (data: z.infer<typeof newTripSchema>) => {
    if (!user.data?.uuid) return;
    try {
      const payload: NewTripPayload = {
        name: data.name,
        summary: data.summary,
        year: data.year,
        public: data.public,
        user_id: user.data?.uuid,
      };

      if (data.days) {
        // @ts-ignore
        payload.days = convertToArray<Day>(data.days, ["stops"]);
      }

      if (payload.builds) {
        payload.builds = JSON.parse(payload.builds);
      }

      if (photos.length !== 0) {
        payload.photos = photos.map(
          (p) =>
            ({
              mime_type: p.fileType,
              name: p.filename,
              url: `https://ioverland.b-cdn.net/${folderRoot}/${user.data?.uuid}/${p.serverId}/${p.filename}`,
              type: "photos",
            } satisfies Omit<Media, "uuid">)
        );
      }

      await create.mutateAsync(payload, {
        onSuccess: () => {
          toast.success("Adventure created");
        },
      });
    } catch (error) {
      console.log(error);
    }
  };

  const addBuildHandler = (builds: Build[]) => {
    // @ts-ignore
    form.setValue("builds", builds);
  };

  const removeBuildHandler = (build: Build) => {
    const builds = buildsWatch.filter((b) => b.uuid !== build.uuid);
    // @ts-ignore
    form.setValue("builds", builds);
  };
  return (
    <>
      <Header />
      <section className="max-w-3xl my-10 mx-auto p-4 lg:p-0">
        {account.data?.plan_limits.can_create_adventures === false && (
          <Info variant="warning">
            <p>
              Looks like your plan doesn&apos;t allow you to create adventures.
              You&apos;ll need to{" "}
              <Link className="underline" href="/dashboard?tab=account">
                upgrade
              </Link>{" "}
              to another plan to create an adventure.
            </p>
          </Info>
        )}
        <div>
          <H1>Create an adventure</H1>
          <p className="text-muted-foreground">
            Fill out some details for your trip and then you can attach it to a
            build if you would like.
          </p>
        </div>
        <Form {...form}>
          <form
            className="mt-6 flex flex-col gap-4 h-full"
            onSubmit={form.handleSubmit(submitHandler, console.log)}
          >
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
                  <Select
                    disabled={
                      account.data?.plan_limits.can_create_adventures === false
                    }
                    onValueChange={field.onChange}
                    value={field.value}
                  >
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
              <MaxFileSizeText
                maxFileUploads={20}
                maxFileSize="20MB"
                type="trip_photos"
              />
              <Uploader
                type="trip_photos"
                allowMultiple
                maxFiles={account.data?.plan_limits.adventure_num_photos}
                maxFileSize={account.data?.plan_limits.max_file_size}
                onUpdate={setPhotos}
                disabled={
                  account.data?.plan_limits.can_create_adventures === false
                }
              />
            </FormItem>

            <div>
              <div className="flex items-center justify-between gap-4">
                <div className="flex flex-col">
                  <Label>Builds</Label>
                  <FormDescription>
                    These builds took part in your adventure
                  </FormDescription>
                </div>

                <ChooseBuild
                  builds={builds ?? []}
                  adventureBuilds={buildsWatch}
                  addBuildHandler={addBuildHandler}
                  disabled={!account.data?.plan_limits.can_create_adventures}
                />
              </div>
              <div className="mt-4 flex flex-col gap-3">
                {buildsWatch?.map((build: Build) => (
                  <div
                    key={build.uuid}
                    className="p-4 rounded-md border border-border flex items-center justify-between gap-4 bg-card"
                  >
                    <div className="flex gap-4 items-center">
                      <div className="w-[80px] rounded-lg overflow-hidden h-[80px] relative">
                        <RenderMedia media={build.banner} />
                      </div>
                      <div className="flex flex-col">
                        <p className="font-bold mb-2">{build.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {build.user?.username}
                        </p>
                      </div>
                    </div>

                    <Button
                      variant="destructiveMuted"
                      onClick={() => removeBuildHandler(build)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* <Separator className="my-6" />
            <div className="flex flex-col">
              <H2 className="text-xl !mb-0">Days</H2>
              <p className="text-muted-foreground">
                Add a day to your trip. You can specify where you stayed, what
                you did, etc.
              </p>
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="mt-3" type="button">
                    Add day
                  </Button>
                </DialogTrigger>

                <DialogContent className="max-w-[1280px]">
                  <ScrollArea className="h-full max-h-[700px]">
                    <DialogHeader>
                      <DialogTitle>Add a day</DialogTitle>
                      <DialogDescription>
                        Add a day to your adventure
                      </DialogDescription>
                    </DialogHeader>

                    <DayForm
                      map={map}
                      addDayHandler={addDayHandler}
                      setOpen={setOpen}
                    />
                  </ScrollArea>
                </DialogContent>
              </Dialog>

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
                        <div className="flex flex-col gap-2">
                          {Object.entries(day.stops).map((stop) => {
                            const stopId = stop[0];
                            const stopData = stop[1];

                            return (
                              <div
                                key={stopId}
                                className="bg-card p-2 rounded-md"
                              >
                                <p className="text-sm text-muted-foreground flex items-baseline gap-2">
                                  <TentTree size={18} />{" "}
                                  {stopData.lat.toFixed(2)},{" "}
                                  {stopData.lng.toFixed(2)}
                                </p>
                                <p className="text-card-foreground text-xs">
                                  {stopData.events}
                                </p>
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
            </div> */}

            <FormField
              control={form.control}
              name="public"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={
                        !account.data?.plan_limits.can_create_adventures
                      }
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Make this adventure public?</FormLabel>
                    <FormDescription>
                      Anyone with the link can access this adventure.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            <Button
              disabled={
                create.isPending ||
                !account.data?.plan_limits.can_create_adventures
              }
            >
              {create.isPending ? (
                <Loader2 className="animate-spin" />
              ) : (
                "Create adventure"
              )}
            </Button>
          </form>
        </Form>
      </section>
    </>
  );
};

export default NewTrip;
