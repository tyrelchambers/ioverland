import Header from "@/components/Header";
import { H1, H3 } from "@/components/Heading";
import Info from "@/components/Info";
import { MaxFileSizeText } from "@/components/MaxFileSize";
import RenderMedia from "@/components/RenderMedia";
import Uploader from "@/components/Uploader";
import AddHistory from "@/components/forms/AddHistory";
import AddLink from "@/components/forms/AddLink";
import AddMod from "@/components/forms/AddMod";
import AddTrip from "@/components/forms/AddTrip";
import HistoryList from "@/components/forms/HistoryList";
import LinksList from "@/components/forms/LinksList";
import ModsList from "@/components/forms/ModsList";
import PhotosList from "@/components/forms/PhotosList";
import TripsList from "@/components/forms/TripsList";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Combobox } from "@/components/ui/combobox";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { carModels, popularCarBrands } from "@/constants";
import { useBuild } from "@/hooks/useBuild";
import { useDomainUser } from "@/hooks/useDomainUser";
import { request } from "@/lib/axios";
import {
  acceptedFiletypes,
  formatPrice,
  formatPricePartToInputValue,
  generateYears,
} from "@/lib/utils";
import {
  EditBuildResponse,
  Media,
  NewBuildSchema,
  Trip,
  BuildPayload,
  newBuildSchema,
} from "@/types";
import { useUser } from "@clerk/nextjs";
import { getAuth } from "@clerk/nextjs/server";
import { zodResolver } from "@hookform/resolvers/zod";
import { createId } from "@paralleldrive/cuid2";
import { FilePondFile } from "filepond";
import { Loader2 } from "lucide-react";
import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

const Edit = () => {
  const router = useRouter();
  const { id } = router.query;
  const { editSettings, update, removeImage, deleteBuild } = useBuild(
    id as string
  );
  const { user } = useUser();
  const {
    account: { data: account },
  } = useDomainUser();

  const [banner, setBanner] = useState<FilePondFile[]>([]);
  const [photos, setPhotos] = useState<FilePondFile[]>([]);

  const form = useForm({
    resolver: zodResolver(newBuildSchema),
    defaultValues: {
      name: "",
      description: "",
      budget: "0",
      trips: {},
      links: {},
      vehicle: {
        model: "",
        make: "",
        year: "",
        type: "",
      },
      public: false,
      banner: "",
      photos: [],
      modifications: {},
      history: {},
    },
  });

  const tripsWatch = form.watch("trips");
  const modsWatch = form.watch("modifications");
  const linksWatch = form.watch("links");
  const photosWatch = form.watch("photos");
  const historyWatch = form.watch("history");

  useEffect(() => {
    if (id && build) {
      const data = build;
      const formattedData: NewBuildSchema = {
        ...data,
        trips: {},
        links: {},
        modifications: {},
        history: {},
      };

      if (data.trips && formattedData.trips) {
        for (let index = 0; index < data.trips.length; index++) {
          const element = data.trips[index];
          if (element.uuid) {
            formattedData.trips[element.uuid] = element;
          }
        }
      }

      if (data.links && formattedData.links) {
        for (let index = 0; index < data.links.length; index++) {
          const element = data.links[index];
          if (element) {
            formattedData.links[createId()] = element;
          }
        }
      }

      if (data.modifications && formattedData.modifications) {
        for (let index = 0; index < data.modifications.length; index++) {
          const element = data.modifications[index];
          formattedData.modifications[createId()] = element;
        }
      }

      if (data.history && formattedData.history) {
        for (let index = 0; index < data.history.length; index++) {
          const element = data.history[index];
          formattedData.history[createId()] = element;
        }
      }

      form.reset(formattedData);
    }
  }, [id, editSettings.data?.build]);

  const build = editSettings.data?.build;
  const remainingPhotos =
    account &&
    account?.plan_limits.max_files - ((build && build?.photos?.length) || 0);
  const watchMake = form.watch("vehicle.make");

  if (!build || !account) return null;

  const submitHandler = async (data: NewBuildSchema) => {
    if (!user?.id) return;

    const modificationsToArray = [];
    const tripsToArray: Trip[] = [];
    const linksToArray = [];
    const historyToArray = [];

    for (const key in data.links) {
      linksToArray.push(data.links[key]);
    }

    for (const key in data.modifications) {
      modificationsToArray.push({
        ...data.modifications[key],
        build_id: Number(build?.uuid),
      });
    }

    for (const key in data.trips) {
      tripsToArray.push({
        ...data.trips[key],
        build_id: Number(build?.uuid),
      });
    }

    for (const key in data.history) {
      historyToArray.push({
        ...data.history[key],
        build_id: Number(build?.uuid),
      });
    }
    const payload: BuildPayload = {
      ...data,
      uuid: build?.uuid,
      trips: tripsToArray,
      links: linksToArray,
      modifications: modificationsToArray,
      user_id: user.id,
      history: historyToArray,
    };

    const folderRoot =
      process.env.NODE_ENV === "development" ? "development" : "production";
    if (banner[0]) {
      payload.banner = {
        mime_type: banner[0].fileType,
        name: banner[0].filename,
        url: `https://ioverland.b-cdn.net/${folderRoot}/${user.id}/${banner[0].serverId}/${banner[0].filename}`,
        type: "banner",
      } satisfies Omit<Media, "uuid">;
    }

    if (photos.length !== 0) {
      payload.photos = photos.map(
        (p) =>
          ({
            mime_type: p.fileType,
            name: p.filename,
            url: `https://ioverland.b-cdn.net/${folderRoot}/${user.id}/${p.serverId}/${p.filename}`,
            type: "photos",
          } satisfies Omit<Media, "uuid">)
      );
    }

    await update.mutateAsync(payload, {
      onSuccess: () => {
        setBanner([]);
        setPhotos([]);
      },
    });
  };

  const removeImageHandler = (
    image_id: string | undefined,
    url: string | undefined
  ) => {
    if (!build?.uuid || !image_id || !url) return;

    removeImage.mutate({
      image_id,
      url,
      build_id: build?.uuid,
    });
  };

  const deleteBuildHandler = () => {
    if (!build?.uuid) return;
    deleteBuild.mutate(
      {
        build_id: build?.uuid,
      },
      {
        onSuccess: () => {
          router.push("/dashboard");
        },
      }
    );
  };

  return (
    <section>
      <Head>
        <title>Edit Build | WildBarrens</title>
      </Head>
      <Header />
      <div className="py-10 p-4  max-w-screen-md mx-auto">
        <Form {...form}>
          <form
            className="flex flex-col gap-4"
            onSubmit={form.handleSubmit(submitHandler)}
          >
            <header className="flex justify-between items-center flex-col md:flex-row">
              <H1>Editing &quot;{build?.name}&quot;</H1>
              <Link href={`/build/${build?.uuid}`}>
                <Button variant="outline" type="button">
                  View build
                </Button>
              </Link>
            </header>
            <div className="flex flex-col">
              <Label className="mb-2">Banner</Label>
              <MaxFileSizeText
                isProPlan={account?.has_subscription}
                maxFileUploads={1}
                maxFileSize={account?.plan_limits.max_file_size}
                type="banner"
              />
              {build?.banner?.url && build?.banner?.id ? (
                <div className="flex flex-col p-4 bg-card rounded-2xl">
                  <div className="relative h-fit flex items-center rounded-md overflow-hidden min-h-[400px]">
                    <RenderMedia media={build?.banner} />
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    className="mt-3"
                    onClick={() =>
                      removeImageHandler(build.banner?.id, build.banner?.url)
                    }
                  >
                    Delete banner
                  </Button>
                </div>
              ) : (
                <Uploader
                  onUpdate={setBanner}
                  acceptedFileTypes={acceptedFiletypes(
                    account?.has_subscription
                  )}
                  allowMultiple={false}
                  maxFiles={1}
                  type="banner"
                  maxFileSize={account?.plan_limits.max_file_size}
                />
              )}
            </div>
            <FormField
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <Input {...field} />
                </FormItem>
              )}
            />

            <FormField
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <Textarea {...field} />
                </FormItem>
              )}
            />

            <FormField
              name="budget"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Budget</FormLabel>
                  <FormDescription>
                    Input your total approximate budget
                  </FormDescription>
                  <Input
                    type="number"
                    {...field}
                    onChange={(v) =>
                      field.onChange(
                        formatPricePartToInputValue(
                          formatPrice(Number(v.currentTarget.value)).parts
                        ).toString()
                      )
                    }
                  />
                  <FormDescription>
                    {formatPrice(field.value).value}
                  </FormDescription>
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 lg:grid-cols-4 items-end gap-4 ">
              <FormField
                name="vehicle.type"
                control={form.control}
                render={({ field }) => (
                  <FormItem className=" flex-1">
                    <FormLabel>Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a type..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="car">Car</SelectItem>
                        <SelectItem value="truck">Truck</SelectItem>
                        <SelectItem value="other">SUV</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                name="vehicle.make"
                render={({ field }) => (
                  <FormItem className=" flex-1">
                    <FormLabel>Make</FormLabel>
                    <Combobox
                      defaultLabel="Select a make..."
                      searchLabel="makes"
                      notFoundLabel="No makes found"
                      data={popularCarBrands}
                      {...field}
                    />
                  </FormItem>
                )}
              />

              {form.getValues("vehicle.make") && (
                <FormField
                  name="vehicle.model"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Make</FormLabel>
                      <Combobox
                        defaultLabel="Select a make..."
                        searchLabel="makes"
                        notFoundLabel="No makes found"
                        data={carModels[watchMake]}
                        {...field}
                      />
                    </FormItem>
                  )}
                />
              )}

              {form.getValues("vehicle.model") && (
                <FormField
                  name="vehicle.year"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Year</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
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
              )}
            </div>

            <Separator className="my-4" />

            <div className="flex flex-col">
              <H3>
                Trips <AddTrip form={form} buildId={build.uuid} />
              </H3>
              <p className="text-muted-foreground">
                Include any trips you&apos;d like to have included with this
                build.
              </p>

              <TripsList trips={tripsWatch} form={form} />
            </div>
            <Separator className="my-4" />

            <section className="flex flex-col">
              <H3>
                Modifications <AddMod form={form} build_id={build.uuid} />
              </H3>
              <p className="text-muted-foreground">
                Include any modifications you&apos;d like to have included with
                this build.
              </p>
              <ModsList mods={modsWatch} form={form} />
            </section>
            <Separator className="my-4" />

            <section className="flex flex-col">
              <H3>
                Links <AddLink form={form} />
              </H3>
              <p className="text-muted-foreground">
                Include any links you&apos;d like to have included with this
                build.
              </p>

              <LinksList links={linksWatch} form={form} />
            </section>
            <Separator className="my-4" />

            <section className="flex flex-col">
              <H3>
                History <AddHistory form={form} buildId={build?.uuid} />
              </H3>
              <p className="text-muted-foreground">
                Add any repairs, maintenace or additions you&apos;ve done over
                the years.
              </p>

              <HistoryList history={historyWatch} form={form} />
            </section>
            <Separator className="my-4" />

            <div className="flex flex-col">
              <Label className="mb-2">Photos</Label>

              <PhotosList
                photos={photosWatch}
                removeImageHandler={removeImageHandler}
              />

              <div className="mt-8">
                <Label>Upload photos </Label>
                <MaxFileSizeText
                  isProPlan={account?.has_subscription}
                  maxFileUploads={account?.plan_limits.max_files}
                  maxFileSize={account?.plan_limits.max_file_size}
                  remainingPhotos={remainingPhotos}
                />
                <Uploader
                  files={photos as any}
                  onUpdate={setPhotos}
                  acceptedFileTypes={acceptedFiletypes(
                    account?.has_subscription
                  )}
                  allowMultiple={true}
                  maxFiles={account?.plan_limits.max_files}
                  type="photos"
                  maxFileSize={account?.plan_limits.max_file_size}
                />
              </div>
            </div>

            <Separator className="my-4" />
            <H3>Visibility</H3>
            <Info>
              <p>
                This build will be published as a{" "}
                <span className="font-bold">Draft</span> unless it&apos;s
                explicitly made public.
              </p>
            </Info>

            <FormField
              control={form.control}
              name="public"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={editSettings.data?.can_be_public === false}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Make this build public?</FormLabel>
                    <FormDescription>
                      Anyone with the link can access this build.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            <div className="flex flex-1 justify-between">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructiveMuted">Delete build</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete
                      your build.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction asChild>
                      <Button
                        type="button"
                        className="!bg-red-500"
                        onClick={deleteBuildHandler}
                      >
                        Delete
                      </Button>
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <Button disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Save build"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </section>
  );
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { userId, getToken } = getAuth(ctx.req);
  const data = await request
    .get<EditBuildResponse>(`/api/build/${ctx.query.id}/edit`, {
      headers: {
        Authorization: `Bearer ${await getToken()}`,
      },
    })
    .then((res) => res.data);

  if (!userId || !data.build) {
    return {
      redirect: {
        permanent: false,
        destination: "/",
      },
    };
  }

  if (data.build.user_id !== userId) {
    return {
      redirect: {
        permanent: false,
        destination: "/",
      },
    };
  }

  return {
    props: {},
  };
};

export default Edit;
