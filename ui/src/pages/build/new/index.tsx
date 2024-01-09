import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import {
  carModels,
  modificationCategories,
  popularCarBrands,
} from "@/constants";
import Image from "next/image";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Separator } from "@/components/ui/separator";
import { useBuild } from "@/hooks/useBuild";
import {
  Modification,
  NewBuildSchemaWithoutUserId,
  Trip,
  newBuildSchema,
  Media,
  BuildPayload,
} from "@/types";
import { useUser } from "@clerk/nextjs";

import { Label } from "@/components/ui/label";
import { FilePondFile } from "filepond";
import Uploader from "@/components/Uploader";
import {
  formattedTrips,
  formattedModifications,
  formattedLinks,
  removeTrip,
  removeModification,
  removeLink,
} from "@/lib/form/helpers";
import { H1, H2 } from "@/components/Heading";
import { Checkbox } from "@/components/ui/checkbox";
import { PlusCircle } from "lucide-react";
import { acceptedFiletypes, findCategorySubcategories } from "@/lib/utils";
import { useDomainUser } from "@/hooks/useDomainUser";
import BuildQuotaMet from "@/components/BuildQuotaMet";
import Header from "@/components/Header";
import { MaxFileSizeText } from "@/components/MaxFileSize";

const Index = () => {
  const { createBuild } = useBuild();
  const { user } = useUser();
  const { account } = useDomainUser();
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
      modifications: {},
      private: false,
    },
    disabled: account.data?.builds_remaining === 0 ? true : false,
  });

  const watchMake = form.watch("vehicle.make");

  const addTripHandler = () => {
    const fTrips = formattedTrips(tripsInput);
    setTripsInput(fTrips);
    form.setValue("trips", fTrips);
  };

  const removeTripHandler = (id: string) => {
    const newTrips = removeTrip(tripsInput, id);
    setTripsInput(newTrips);
    form.setValue("trips", newTrips);
  };

  const addModification = () => {
    const mods = formattedModifications(modifications);

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

  const submitHandler = (data: NewBuildSchemaWithoutUserId) => {
    if (!user?.id) return;

    const modificationsToArray = [];
    const tripsToArray = [];
    const linksToArray = [];

    for (const key in data.links) {
      linksToArray.push(data.links[key]);
    }
    for (const key in data.modifications) {
      modificationsToArray.push(data.modifications[key]);
    }

    for (const key in data.trips) {
      tripsToArray.push({
        ...data.trips[key],
      });
    }

    const payload: BuildPayload = {
      ...data,
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

    createBuild.mutate(payload);
  };

  return (
    <section className="flex">
      <div className="sticky top-0 h-screen min-w-[400px] max-w-[600px] w-full hidden lg:block">
        <div
          className=" absolute z-10 inset-0"
          style={{
            boxShadow: "inset 0 0 40px rgba(0, 0, 0, 0.5)",
          }}
        ></div>
        <Image
          src="/thomas-tucker-QsiuD0w95h0-unsplash (1) (1).jpg"
          alt=""
          fill
          objectFit="cover"
        />
      </div>
      <div className="flex flex-col w-full">
        <Header />
        {account?.data?.builds_remaining === 0 ? <BuildQuotaMet /> : null}
        <div className="p-4 lg:p-10 w-full max-w-2xl flex-1">
          <H1>Let&apos;s build</H1>
          <p className="text-muted-foreground">
            Create your first build here. Include as many or as little details
            as you want.
          </p>
          <Form {...form}>
            <form
              className="w-full mt-10 flex flex-col gap-4"
              onSubmit={form.handleSubmit(submitHandler, console.log)}
            >
              <H2>The Basics</H2>

              <FormField
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <Input placeholder="What's your build name" {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <Textarea
                      placeholder="What inspired your build?"
                      {...field}
                    />
                  </FormItem>
                )}
              />

              <FormField
                name="budget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Budget</FormLabel>
                    <FormDescription>
                      How much did you spend on this build, roughly?
                    </FormDescription>
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

                {form.getValues("vehicle.make") && watchMake && (
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
              <div className="flex flex-col">
                <Label className="mb-2">Banner</Label>
                <MaxFileSizeText
                  isProPlan={account.data?.has_subscription}
                  maxFileSize={account?.data?.max_file_size}
                />
                <Uploader
                  onUpdate={setBanner}
                  acceptedFileTypes={acceptedFiletypes(
                    account.data?.has_subscription
                  )}
                  allowMultiple={false}
                  maxFiles={1}
                  type="banner"
                  maxFileSize={account.data?.max_file_size}
                  disabled={form.formState.disabled}
                />
              </div>
              <Separator className="my-4" />
              <div className="flex flex-col">
                <H2>
                  Trips{" "}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={addTripHandler}
                  >
                    <PlusCircle />
                  </Button>
                </H2>
                <div className="flex flex-col gap-2">
                  {Object.keys(tripsInput).map((input, index) => {
                    return (
                      <div className="bg-card rounded-xl p-4" key={input}>
                        <header className="flex flex-row justify-between">
                          <p className="font-serif">Trip #{index + 1}</p>
                          <Button
                            type="button"
                            variant="link"
                            className="text-red-500"
                            size="sm"
                            onClick={() => removeTripHandler(input)}
                          >
                            Remove
                          </Button>
                        </header>
                        <div className="flex flex-col lg:flex-row flex-1 gap-4">
                          <FormField
                            name={`trips[${input}].name`}
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <FormLabel>Name</FormLabel>
                                <Input
                                  placeholder="eg: Valley of the Gods Road, The Alpine Loop"
                                  {...field}
                                />
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
                      </div>
                    );
                  })}
                </div>
              </div>
              <Separator className="my-4" />

              <section className="flex flex-col">
                <H2>
                  Modifications{" "}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={addModification}
                  >
                    <PlusCircle />
                  </Button>
                </H2>
                {Object.keys(modifications).map((input, index) => {
                  const itemKey = form.getValues(`modifications`) as {
                    [key: string]: Modification;
                  };
                  const item = itemKey[input];
                  const subcategories =
                    item.category && findCategorySubcategories(item.category);
                  return (
                    <div className="bg-card rounded-xl p-4" key={input}>
                      <header className="flex flex-row justify-between">
                        <p className="font-serif">Modification #{index + 1}</p>
                        <Button
                          type="button"
                          variant="link"
                          className="text-red-500"
                          size="sm"
                          onClick={() => removeModificationHandler(input)}
                        >
                          Remove
                        </Button>
                      </header>
                      <FormField
                        name={`modifications[${input}].category`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category</FormLabel>
                            <Combobox
                              defaultLabel="Select a make..."
                              searchLabel="makes"
                              notFoundLabel="No makes found"
                              data={modificationCategories}
                              {...field}
                            />
                          </FormItem>
                        )}
                      />

                      {item.category && subcategories && (
                        <FormField
                          name={`modifications[${input}].subcategory`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Sub-category</FormLabel>
                              <Combobox
                                defaultLabel="Select a sub-category..."
                                searchLabel="sub-categories"
                                notFoundLabel="No sub-categories found"
                                data={subcategories}
                                {...field}
                              />
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
                    </div>
                  );
                })}
              </section>

              <Separator className="my-4" />

              <section className="flex flex-col">
                <H2>
                  Links{" "}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={addLink}
                  >
                    <PlusCircle />
                  </Button>
                </H2>
                <p className="text-muted-foreground">
                  Include any links you&apos;d like to have included with this
                  build.
                </p>

                {Object.keys(buildLinks).map((input, index) => {
                  return (
                    <div className="bg-card rounded-xl p-4" key={input}>
                      <header className="flex flex-row justify-between">
                        <p className="font-serif">Link #{index + 1}</p>
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
                          </FormItem>
                        )}
                      />
                    </div>
                  );
                })}
              </section>
              <Separator className="my-4" />

              <div className="flex flex-col">
                <Label className="mb-2">Photos</Label>
                <MaxFileSizeText
                  isProPlan={account.data?.has_subscription}
                  additional="Max files 6"
                  maxFileSize={account?.data?.max_file_size}
                />

                <Uploader
                  onUpdate={setPhotos}
                  acceptedFileTypes={acceptedFiletypes(
                    account.data?.has_subscription
                  )}
                  allowMultiple={true}
                  maxFiles={6}
                  type="photos"
                  maxFileSize={account.data?.max_file_size}
                  disabled={form.formState.disabled}
                />
              </div>

              <Separator className="my-4" />
              <FormField
                control={form.control}
                name="private"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Make this build private?</FormLabel>
                      <FormDescription>
                        Making this build private will hide it from other users
                        so no one can see it.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              <Button
                disabled={!form.formState.isValid || form.formState.disabled}
              >
                Save build
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </section>
  );
};

export default Index;
