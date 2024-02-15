import Header from "@/components/Header";
import { H1, H2 } from "@/components/Heading";
import { MaxFileSizeText } from "@/components/MaxFileSize";
import RenderMedia from "@/components/RenderMedia";
import Uploader from "@/components/Uploader";
import PhotosList from "@/components/forms/PhotosList";
import ChooseBuild from "@/components/trip/ChooseBuild";
import DayForm from "@/components/trip/forms/Day";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { folderRoot } from "@/constants";
import { useAdventure } from "@/hooks/useAdventure";
import { useDomainUser } from "@/hooks/useDomainUser";
import { convertToArray, convertToObject, generateYears } from "@/lib/utils";
import {
  Build,
  Day,
  Media,
  NewTripPayload,
  NewTripSchema,
  daySchema,
  newTripSchema,
} from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { createId } from "@paralleldrive/cuid2";
import { FilePondFile } from "filepond";
import { Loader2, TentTree } from "lucide-react";
import { useRouter } from "next/router";
import React, { useEffect, useRef } from "react";
import { FilePond } from "react-filepond";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const Edit = () => {
  const { account, user } = useDomainUser();
  const router = useRouter();
  const {
    update,
    adventureById,
    removeImage,
    removeBuild,
    removeDay,
    deleteAdventure,
  } = useAdventure({
    adventureId: router.query.id as string,
  });
  const [photos, setPhotos] = React.useState<FilePondFile[]>([]);
  const [open, setOpen] = React.useState(false);
  const form = useForm({
    resolver: zodResolver(newTripSchema),
    defaultValues: {
      name: "",
      summary: "",
      year: "",
      builds: [],
      days: {},
      photos: [],
    },
  });
  const daysWatch = form.watch("days");
  const photosWatch = form.watch("photos");
  const buildsWatch: Build[] = form.watch("builds");

  const builds = user.data?.builds;

  useEffect(() => {
    const adv = adventureById.data;

    if (!adv) return;

    const payload: NewTripSchema = {
      ...adv,
    };

    if (payload.days) {
      console.log("payload.days", payload.days);

      payload.days = convertToObject<Day>(adv.days, ["stops"]);
    }

    form.reset(payload);
  }, [adventureById.data]);

  const submitHandler = async (data: z.infer<typeof newTripSchema>) => {
    try {
      const payload: NewTripPayload = {
        uuid: adventureById.data?.uuid,
        name: data.name,
        summary: data.summary,
        year: data.year,
        builds: data.builds,
      };

      if (data.days) {
        payload.days = convertToArray<Day>(data.days, ["stops"]);
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

      console.log(data);

      await update.mutateAsync(payload, {
        onSuccess: () => {
          toast.success("Adventure created");
        },
      });
    } catch (error) {
      console.log(error);
    }
  };

  const removeDayHandler = (id: string | undefined, tempId: string) => {
    if (!adventureById.data?.uuid) return;

    const clone: Record<string, Day> = { ...form.getValues("days") };

    if (clone[tempId]) {
      delete clone[tempId];
      form.setValue("days", clone);
    }

    removeDay.mutate({
      adv_id: adventureById.data?.uuid,
      day_id: id,
    });
  };

  const addDayHandler = (data: z.infer<typeof daySchema>) => {
    const newDay: Record<string, Day> = {
      [createId()]: data,
    };

    form.setValue("days", { ...form.getValues("days"), ...newDay });
  };

  const removeImageHandler = (
    image_id: string | undefined,
    url: string | undefined
  ) => {
    if (!adventureById.data?.uuid || !image_id || !url) return;

    removeImage.mutate({
      image_id,
      url,
      adv_id: adventureById.data?.uuid,
    });
  };

  const addBuildHandler = (builds: Build[]) => {
    form.setValue("builds", builds);
  };

  const removeBuildHandler = (buildId: string | undefined) => {
    if (!adventureById.data?.uuid || !buildId) return;
    removeBuild.mutate({
      adv_id: adventureById.data?.uuid,
      build_id: buildId,
    });
  };

  const deleteHandler = () => {
    if (!adventureById.data?.uuid) return;
    deleteAdventure.mutate({ adv_id: adventureById.data?.uuid });
  };

  return (
    <div>
      <Header />

      <section className="max-w-screen-md mx-auto my-10">
        <H1>Editing &quot;{adventureById.data?.name}&quot;</H1>
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

              <PhotosList
                photos={photosWatch}
                removeImageHandler={removeImageHandler}
              />
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
                      onClick={() => removeBuildHandler(build.id)}
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

                    <DayForm addDayHandler={addDayHandler} setOpen={setOpen} />
                  </ScrollArea>
                </DialogContent>
              </Dialog>

              <div className="mt-3">
                {daysWatch &&
                  Object.entries(daysWatch).map((input) => {
                    const id = input[0];
                    const day = input[1] as Day;

                    return (
                      <div
                        key={id}
                        className="border border-border p-4 rounded-md flex flex-col gap-2"
                      >
                        <p className="font-bold">Day {day.day_number}</p>
                        {day.notes && (
                          <p className="text-muted-foreground">{day.notes}</p>
                        )}
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
                          onClick={() => removeDayHandler(day.uuid, id)}
                        >
                          Remove day
                        </Button>
                      </div>
                    );
                  })}
              </div>
            </div> */}

            <footer className="flex items-center justify-between">
              <Button
                type="button"
                variant="destructiveMuted"
                onClick={deleteHandler}
              >
                Delete adventure
              </Button>
              <Button disabled={update.isPending}>
                {update.isPending ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  "Update adventure"
                )}
              </Button>
            </footer>
          </form>
        </Form>
      </section>
    </div>
  );
};

export default Edit;
