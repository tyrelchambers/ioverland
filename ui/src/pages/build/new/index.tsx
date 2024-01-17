import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import { carModels, folderRoot, popularCarBrands } from "@/constants";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Separator } from "@/components/ui/separator";
import { useBuild } from "@/hooks/useBuild";
import {
  NewBuildSchemaWithoutUserId,
  newBuildSchema,
  Media,
  BuildPayload,
} from "@/types";
import { useUser } from "@clerk/nextjs";

import { Label } from "@/components/ui/label";
import { FilePondFile } from "filepond";
import Uploader from "@/components/Uploader";
import { H1, H3 } from "@/components/Heading";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { acceptedFiletypes } from "@/lib/utils";
import { useDomainUser } from "@/hooks/useDomainUser";
import BuildQuotaMet from "@/components/BuildQuotaMet";
import Header from "@/components/Header";
import { MaxFileSizeText } from "@/components/MaxFileSize";
import Info from "@/components/Info";
import AddTrip from "@/components/forms/AddTrip";
import TripsList from "@/components/forms/TripsList";
import AddMod from "@/components/forms/AddMod";
import ModsList from "@/components/forms/ModsList";
import AddLink from "@/components/forms/AddLink";
import LinksList from "@/components/forms/LinksList";

const Index = () => {
  const { createBuild } = useBuild();
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
      },
      modifications: {},
      public: false,
    },
    disabled: account?.builds_remaining === 0 ? true : false,
  });

  const watchMake = form.watch("vehicle.make");
  const tripsWatch = form.watch("trips");
  const modsWatch = form.watch("modifications");
  const linksWatch = form.watch("links");

  const submitHandler = async (data: NewBuildSchemaWithoutUserId) => {
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

    await createBuild.mutateAsync(payload);
  };

  return (
    <section>
      <Header />
      <div className="max-w-screen-md mx-auto my-10 relative h-full">
        {account?.builds_remaining === 0 ? <BuildQuotaMet /> : null}
        <div className="p-4">
          <H1>Let&apos;s build</H1>
          <p className="text-muted-foreground">
            Create your first build here. Include as many or as little details
            as you want.
          </p>
          <Form {...form}>
            <form
              className="flex flex-col gap-4 mt-10"
              onSubmit={form.handleSubmit(submitHandler, console.log)}
            >
              <div className="flex flex-col">
                <Label className="mb-2">Banner</Label>
                <MaxFileSizeText
                  isProPlan={account?.has_subscription}
                  maxFileUploads={1}
                  maxFileSize={account?.plan_limits.max_file_size}
                  type="banner"
                />
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
                  Trips <AddTrip form={form} />
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
                  Modifications <AddMod form={form} />
                </H3>
                <p className="text-muted-foreground">
                  Include any modifications you&apos;d like to have included
                  with this build.
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

              <div className="flex flex-col">
                <Label className="mb-2">Photos</Label>

                <div className="mt-8">
                  <Label>Upload photos </Label>
                  <MaxFileSizeText
                    isProPlan={account?.has_subscription}
                    maxFileUploads={account?.plan_limits.max_files}
                    maxFileSize={account?.plan_limits.max_file_size}
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
              <Button disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Create build"
                )}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </section>
  );
};

export default Index;
