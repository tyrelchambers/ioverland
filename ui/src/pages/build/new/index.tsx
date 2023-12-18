import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import {
  Form,
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
  Build,
  NewBuildSchemaWithoutUserId,
  Trip,
  newBuildSchema,
  Media,
} from "@/types";
import { useUser } from "@clerk/nextjs";
import { useToast } from "@/components/ui/use-toast";

import { Label } from "@/components/ui/label";
import { FilePondFile, FileStatus } from "filepond";
import Uploader from "@/components/Uploader";
import {
  formattedTrips,
  formattedModifications,
  formattedLinks,
  removeTrip,
  removeModification,
  removeLink,
} from "@/lib/form/helpers";
import { isValid } from "zod";

const Index = () => {
  const { toast } = useToast();

  const { createBuild } = useBuild();
  const { user } = useUser();
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

  const findCategorySubcategories = (category: string) => {
    return modificationCategories.find((d) => d.value === category)
      ?.subcategories;
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

    interface Payload extends Build {
      banner?: Media;
      photos?: Media[];
    }

    const payload: Payload = {
      ...data,
      trips: tripsToArray,
      links: linksToArray,
      modifications: modificationsToArray,
      user_id: user.id,
    };

    if (banner[0]) {
      payload.banner = JSON.parse(banner[0].serverId);
    }

    if (photos.length !== 0) {
      payload.photos = photos.map((d) => JSON.parse(d.serverId));
    }

    createBuild.mutate(payload, {
      onSuccess: () => {
        toast({
          variant: "success",
          title: "Build created",
          description: "Your build has been created. Nice!",
        });
      },
    });
  };

  return (
    <section className="flex">
      <div className="relative h-screen w-1/2">
        <div
          className="absolute z-10 inset-0"
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
      <div className=" p-10 h-screen overflow-y-auto flex-1">
        <h1 className="text-5xl font-serif">Let&apos;s build</h1>
        <p>
          Create your first build here. Include as many or as little details as
          you want.
        </p>
        <Form {...form}>
          <form
            className="w-full mt-10 flex flex-col gap-4"
            onSubmit={form.handleSubmit(submitHandler, console.log)}
          >
            <h2 className="font-serif text-2xl">The Basics</h2>
            <div className="flex flex-col">
              <Label className="mb-2">Banner</Label>
              <Uploader
                onUpdate={setBanner}
                acceptedFileTypes={["image/jpg", "image/jpeg", "image/png"]}
                allowMultiple={false}
                maxFiles={1}
                type="banner"
              />
            </div>
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
                  <Input type="number" {...field} />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-3 items-end gap-4 ">
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

            <Separator className="my-4" />
            <div className="flex flex-col">
              <p className="font-serif text-2xl">Trips</p>
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
                      <div className="flex flex-1 gap-4">
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
              <Button
                type="button"
                variant="secondary"
                className="mt-4"
                onClick={addTripHandler}
              >
                Add trip
              </Button>
            </div>
            <Separator className="my-4" />

            <section className="flex flex-col">
              <h2 className="font-serif text-2xl">Modifications</h2>
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
                            <FormLabel>Category</FormLabel>
                            <Combobox
                              defaultLabel="Select a make..."
                              searchLabel="makes"
                              notFoundLabel="No makes found"
                              data={subcategories}
                              {...field}
                            />
                          </FormItem>
                        )}
                      />
                    )}

                    <div className="flex gap-3">
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

              <Button
                type="button"
                variant="secondary"
                className="mt-4"
                onClick={addModification}
              >
                Add modification
              </Button>
            </section>

            <Separator className="my-4" />

            <section className="flex flex-col">
              <h2 className="font-serif text-2xl leading-tight">Links</h2>
              <p>
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

              <Button
                type="button"
                variant="secondary"
                className="mt-4"
                onClick={addLink}
              >
                Add link
              </Button>
            </section>

            <div className="flex flex-col">
              <Label className="mb-2">Photos</Label>
              <Uploader
                onUpdate={setPhotos}
                acceptedFileTypes={["image/jpg", "image/jpeg", "image/png"]}
                allowMultiple={true}
                maxFiles={6}
                type="photos"
              />
            </div>

            <Separator className="my-4" />
            <Button disabled={!form.formState.isValid}>Save build</Button>
          </form>
        </Form>
      </div>
    </section>
  );
};

export default Index;
