import Header from "@/components/Header";
import { H1, H2, H3 } from "@/components/Heading";
import Info from "@/components/Info";
import { MaxFileSizeText } from "@/components/MaxFileSize";
import RenderMedia from "@/components/RenderMedia";
import StyledBlock from "@/components/StyledBlock";
import Uploader from "@/components/Uploader";
import { Alert } from "@/components/ui/alert";
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
  FormMessage,
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
import {
  carModels,
  modificationCategories,
  popularCarBrands,
} from "@/constants";
import { useBuild } from "@/hooks/useBuild";
import { useDomainUser } from "@/hooks/useDomainUser";
import { useTrips } from "@/hooks/useTrips";
import { request } from "@/lib/axios";
import {
  formattedLinks,
  formattedModifications,
  formattedTrips,
  removeLink,
  removeModification,
  removeTrip,
} from "@/lib/form/helpers";
import {
  acceptedFiletypes,
  cn,
  findCategorySubcategories,
  getMaxFileSize,
} from "@/lib/utils";
import {
  Build,
  EditBuildResponse,
  Media,
  Modification,
  NewBuildSchema,
  NewBuildSchemaWithoutUserId,
  Trip,
  BuildPayload,
  newBuildSchema,
} from "@/types";
import { useUser } from "@clerk/nextjs";
import { getAuth } from "@clerk/nextjs/server";
import { zodResolver } from "@hookform/resolvers/zod";
import cuid2, { createId } from "@paralleldrive/cuid2";
import { FilePondFile } from "filepond";
import { ImageIcon, Loader2, PlusCircle, Trash } from "lucide-react";
import { GetServerSideProps } from "next";
import { env } from "next-runtime-env";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

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

  const [tripsInput, setTripsInput] = useState<{
    [key: string]: Trip;
  }>({});
  const [modifications, setModifications] = useState<{
    [key: string]: Modification;
  }>({});
  const [buildLinks, setBuildLinks] = useState<{
    [key: string]: string;
  }>({});
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
      },
      public: false,
      banner: "",
      photos: [],
      modifications: {},
    },
  });

  useEffect(() => {
    if (id && build) {
      const data = build;
      const formattedData: NewBuildSchema = {
        ...data,
        trips: {},
        links: {},
        modifications: {},
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

      setBuildLinks(formattedData.links as { [key: string]: string });
      setModifications(
        formattedData.modifications as {
          [key: string]: Modification;
        }
      );
      setTripsInput(formattedData.trips as { [key: string]: Trip });

      form.reset(formattedData);
    }
  }, [id, editSettings.data?.build]);

  const build = editSettings.data?.build;
  const remainingPhotos =
    account &&
    account?.plan_limits.max_files - ((build && build?.photos?.length) || 0);
  const watchMake = form.watch("vehicle.make");

  if (!build || !account) return null;

  const addTripHandler = () => {
    const fTrips = formattedTrips(tripsInput, {
      build_id: String(build?.id),
    });
    setTripsInput(fTrips);
    form.setValue("trips", fTrips);
  };

  const removeTripHandler = (id: string) => {
    const newTrips = removeTrip(tripsInput, id);

    setTripsInput(newTrips);
    form.setValue("trips", newTrips);
  };

  const addModification = () => {
    const mods = formattedModifications(modifications, {
      build_id: String(build?.id),
    });

    setModifications(mods);
    form.setValue("modifications", mods);
  };

  const removeModificationHandler = (id: string) => {
    const mods = removeModification(modifications, id);

    setModifications(mods);
    form.setValue("modifications", mods);
  };

  const addLink = () => {
    const links = formattedLinks(buildLinks);

    setBuildLinks(links);
    form.setValue("links", links);
  };

  const removeLinkHandler = (id: string) => {
    const links = removeLink(buildLinks, id);

    setBuildLinks(links);
    form.setValue("links", links);
  };

  const submitHandler = async (data: NewBuildSchemaWithoutUserId) => {
    if (!user?.id) return;

    const modificationsToArray = [];
    const tripsToArray: Trip[] = [];
    const linksToArray = [];

    for (const key in data.links) {
      linksToArray.push(data.links[key]);
    }

    for (const key in data.modifications) {
      modificationsToArray.push({
        ...data.modifications[key],
        build_id: Number(build?.id),
      });
    }

    for (const key in data.trips) {
      tripsToArray.push({
        ...data.trips[key],
        build_id: Number(build?.id),
      });
    }

    const payload: BuildPayload = {
      ...data,
      id: build?.id,
      trips: tripsToArray,
      links: linksToArray,
      modifications: modificationsToArray,
      user_id: user.id,
    };

    const folderRoot =
      process.env.NODE_ENV === "development" ? "development" : "production";
    try {
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
    } catch (error) {
      console.log(error);
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
      <Header />
      <div className="py-10 p-4  max-w-screen-md mx-auto">
        <Form {...form}>
          <form
            className="flex flex-col gap-4"
            onSubmit={form.handleSubmit(submitHandler, console.log)}
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
                  <Input type="number" {...field} />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 items-end gap-4 ">
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
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Year</FormLabel>
                      <Input type="number" min={0} {...field} />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <Separator className="my-4" />

            <div className="flex flex-col">
              <H3>
                Trips{" "}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={addTripHandler}
                >
                  <PlusCircle />
                </Button>
              </H3>
              {Object.keys(tripsInput).length > 0 && (
                <div className="flex flex-col mt-6 gap-2">
                  {Object.keys(tripsInput).map((input, index) => {
                    // @ts-ignore
                    const deleteItem = form.getValues(`trips[${input}].delete`);

                    return (
                      <div
                        className={cn(
                          "bg-card rounded-xl p-4",
                          deleteItem && "border-red-500 bg-red-100 border"
                        )}
                        key={input}
                      >
                        <div className="flex flex-1 flex-col lg:flex-row gap-4">
                          <FormField
                            name={`trips[${input}].name`}
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <FormLabel>Name</FormLabel>
                                <Input
                                  placeholder="eg: Valley of the Gods Road, The Alpine Loop"
                                  {...field}
                                />
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            name={`trips[${input}].year`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Year</FormLabel>
                                <Input type="number" min={0} {...field} />
                              </FormItem>
                            )}
                          />
                        </div>
                        <footer className="flex flex-row justify-end">
                          <Button
                            type="button"
                            variant="outline"
                            className="text-red-500"
                            size="sm"
                            onClick={() => removeTripHandler(input)}
                          >
                            Remove
                          </Button>
                        </footer>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <Separator className="my-4" />

            <section className="flex flex-col">
              <H3>
                Modifications{" "}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={addModification}
                >
                  <PlusCircle />
                </Button>
              </H3>
              {Object.keys(modifications).length > 0 && (
                <div className="flex flex-col gap-3 mt-6">
                  {Object.keys(modifications).map((input, index) => {
                    const itemKey = form.getValues(`modifications`) as {
                      [key: string]: Modification;
                    };
                    const item = itemKey[input];
                    const subcategories =
                      findCategorySubcategories(item?.category) ?? [];
                    return (
                      <div className="bg-card rounded-xl p-4" key={input}>
                        <FormField
                          name={`modifications[${input}].category`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Category</FormLabel>

                              <Select
                                onValueChange={(value) => {
                                  form.setValue(
                                    // @ts-ignore
                                    `modifications[${input}].category`,
                                    value
                                  );
                                }}
                                defaultValue={field.value}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Category" />
                                </SelectTrigger>
                                <SelectContent>
                                  {modificationCategories.map((category) => (
                                    <SelectItem
                                      key={category.label}
                                      className="w-full"
                                      value={category.value}
                                    >
                                      {category.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />
                        {/* @ts-ignore */}
                        {form.watch(`modifications[${input}].category`) && (
                          <FormField
                            name={`modifications[${input}].subcategory`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Subcategory</FormLabel>
                                <Select
                                  onValueChange={(value) => {
                                    form.setValue(
                                      // @ts-ignore
                                      `modifications[${input}].subcategory`,
                                      value
                                    );
                                  }}
                                  defaultValue={field.value}
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Subcategory" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {subcategories?.map((category) => (
                                      <SelectItem
                                        key={category.label}
                                        className="w-full"
                                        value={category.value}
                                      >
                                        {category.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </FormItem>
                            )}
                          />
                        )}

                        <div className="flex flex-col lg:flex-row gap-3">
                          <FormField
                            name={`modifications[${input}].name`}
                            render={({ field }) => (
                              <div className="flex-1">
                                <FormItem>
                                  <FormLabel>Name</FormLabel>
                                  <Input
                                    placeholder="What's the name of the modification?"
                                    {...field}
                                  />
                                </FormItem>
                              </div>
                            )}
                          />

                          <FormField
                            name={`modifications[${input}].price`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Price</FormLabel>
                                <Input
                                  type="number"
                                  min={0}
                                  placeholder="What's the name of the modification?"
                                  {...field}
                                />
                              </FormItem>
                            )}
                          />
                        </div>
                        <footer className="flex items-center justify-end">
                          <Button
                            type="button"
                            variant="link"
                            className="text-red-500"
                            size="sm"
                            onClick={() => removeModificationHandler(input)}
                          >
                            Remove
                          </Button>
                        </footer>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
            <Separator className="my-4" />

            <section className="flex flex-col">
              <H3>
                Links{" "}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={addLink}
                >
                  <PlusCircle />
                </Button>
              </H3>
              <p className="text-muted-foreground">
                Include any links you&apos;d like to have included with this
                build.
              </p>

              {Object.keys(buildLinks).length > 0 && (
                <div className="flex flex-col gap-3 mt-6">
                  {Object.keys(buildLinks).map((input, index) => {
                    return (
                      <div className="bg-card rounded-xl p-4" key={input}>
                        <header className="flex flex-row justify-between">
                          <p>Link #{index + 1}</p>
                          <Button
                            type="button"
                            variant="link"
                            className="text-red-500"
                            size="sm"
                            onClick={() => removeLinkHandler(input)}
                          >
                            Remove
                          </Button>
                        </header>
                        <FormField
                          name={`links[${input}]`}
                          render={({ field }) => (
                            <FormItem>
                              <Input placeholder="https://" {...field} />
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
            <Separator className="my-4" />

            <div className="flex flex-col">
              <Label className="mb-2">Photos</Label>

              {build?.photos && build?.photos.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {build?.photos?.map((photo, index) => {
                    return (
                      <div
                        className=" flex flex-col items-center gap-4 relative  shadow-xl rounded-xl overflow-hidden"
                        key={photo.id}
                      >
                        {photo.mime_type.includes("image") ? (
                          <div className="relative w-full h-[200px]">
                            <Image
                              src={photo.url}
                              alt=""
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <video controls className="h-[200px] w-full">
                            <source src={photo.url} type={photo.mime_type} />
                          </video>
                        )}
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2"
                          onClick={() =>
                            removeImageHandler(photo.id, photo.url)
                          }
                        >
                          <Trash size={18} />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <StyledBlock
                  text="No uploaded photos for this build."
                  icon={<ImageIcon />}
                />
              )}

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
                      your account and remove your data from our servers.
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
