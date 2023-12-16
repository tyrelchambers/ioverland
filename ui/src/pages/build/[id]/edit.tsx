import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { Form, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import {
  carModels,
  modificationCategories,
  popularCarBrands,
} from "@/constants";
import { useBuild } from "@/hooks/useBuild";
import {
  Build,
  Modification,
  NewBuildSchema,
  NewBuildSchemaWithoutUserId,
  Trip,
  buildSchema,
  newBuildSchema,
} from "@/types";
import { useUser } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { createId } from "@paralleldrive/cuid2";
import { FilePondFile } from "filepond";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

const Edit = () => {
  const router = useRouter();
  const { id } = router.query;
  const { getById, update } = useBuild(id as string);
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
  });

  useEffect(() => {
    if (id && getById.data) {
      const data = getById.data;
      const formattedData: NewBuildSchema = {
        ...data,
        trips: {},
        links: {},
        modifications: {},
      };

      if (data.trips && formattedData.trips) {
        for (let index = 0; index < data.trips.length; index++) {
          const element = data.trips[index];
          formattedData.trips[createId()] = element;
        }
      }

      if (data.links && formattedData.links) {
        for (let index = 0; index < data.links.length; index++) {
          const element = data.links[index];
          formattedData.links[createId()] = element;
        }
      }

      if (data.modifications && formattedData.modifications) {
        for (let index = 0; index < data.modifications.length; index++) {
          const element = data.modifications[index];
          formattedData.modifications[createId()] = element;
        }
      }

      setBuildLinks(formattedData.links);
      setModifications(formattedData.modifications);
      setTripsInput(formattedData.trips);

      form.reset(formattedData);
    }
  }, [id, getById.data]);

  const watchMake = form.watch("vehicle.make");

  const addTripInput = () => {
    const id = createId();
    const trips = { ...tripsInput };
    trips[id] = {
      name: "",
      year: "0",
    };

    setTripsInput(trips);
    form.setValue("trips", trips);
  };

  const removeTrip = (id: string) => {
    const trips = { ...tripsInput };
    delete trips[id];

    setTripsInput(trips);
    form.setValue("trips", trips);
  };

  const addModification = () => {
    const id = createId();
    const mods = { ...modifications };
    mods[id] = {
      category: "",
      subcategory: "",
      name: "",
      price: "0",
    };

    setModifications(mods);
    form.setValue("modifications", mods);
  };

  const removeModification = (id: string) => {
    const mods = { ...modifications };
    delete mods[id];

    setModifications(mods);
    form.setValue("modifications", mods);
  };

  const addLink = () => {
    const id = createId();
    const links = { ...buildLinks };
    links[id] = "";

    setBuildLinks(links);
    form.setValue("links", links);
  };

  const removeLink = (id: string) => {
    const links = { ...buildLinks };
    delete links[id];

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
    const tripsToArray: Trip[] = [];
    const linksToArray = [];

    for (const key in data.links) {
      linksToArray.push(data.links[key]);
    }
    for (const key in data.modifications) {
      modificationsToArray.push(data.modifications[key]);
    }

    for (const key in data.trips) {
      tripsToArray.push(data.trips[key]);
    }

    interface Payload extends Build {
      banner?: string;
      photos?: string[];
    }

    const payload: Payload = {
      ...data,
      trips: tripsToArray,
      links: linksToArray,
      modifications: modificationsToArray,
      user_id: user.id,
    };

    if (banner[0]) {
      payload.banner = banner[0].serverId;
    }

    if (photos.length !== 0) {
      payload.photos = photos.map((d) => d.serverId);
    }

    update.mutate(payload, {
      onSuccess: () => {
        toast({
          variant: "success",
          title: "Build updated",
          description: "Your build has been updated!",
        });
      },
    });
  };

  return (
    <div>
      <Form {...form}>
        <form
          className="flex flex-col gap-4"
          onSubmit={form.handleSubmit(submitHandler, console.log)}
        >
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
                        onClick={() => removeTrip(input)}
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
              onClick={addTripInput}
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
                      onClick={() => removeModification(input)}
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
                      onClick={() => removeLink(input)}
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

          <Button>Save changes</Button>
        </form>
      </Form>
    </div>
  );
};

export default Edit;
