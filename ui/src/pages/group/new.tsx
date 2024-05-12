import GroupPrivacyChip from "@/components/GroupPrivacyChip";
import Header from "@/components/Header";
import { AvatarWrapper } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Form,
  FormControl,
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
import { Textarea } from "@/components/ui/textarea";
import { useDomainUser } from "@/hooks/useDomainUser";
import { useGroup } from "@/hooks/useGroup";
import { getTheme, groupThemes, themeMap, TThemeMap } from "@/lib/mapTheme";
import { NewGroupSchema, newGroupSchema } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

const NewGroup = () => {
  const { user } = useDomainUser();
  const { create } = useGroup();

  const form = useForm<NewGroupSchema>({
    resolver: zodResolver(newGroupSchema),
    defaultValues: {
      name: "",
      description: "",
      privacy: "private",
      themePreset: "default",
    },
  });

  const themeWatch = form.watch("themePreset") as keyof typeof getTheme;
  const nameWatch = form.watch("name");
  const descriptionWatch = form.watch("description");
  const privacyWatch = form.watch("privacy");

  const submitHandler = (data: NewGroupSchema) => {
    const payload: NewGroupSchema & { theme: TThemeMap[keyof TThemeMap] } = {
      ...data,
      theme: getTheme(data.themePreset),
    };

    create.mutate(payload, {
      onSuccess: () => {
        form.reset();
        toast.success("Group created");
      },
    });
  };

  return (
    <main>
      <Header />

      <section className="grid grid-cols-[300px_1fr] h-[calc(100vh-100px)]">
        <header className=" flex flex-col p-4 border-border border-r ">
          <h1 className="text-2xl font-bold mb-4">Create group</h1>

          <div className="flex items-center gap-4 bg-card p-2 rounded-md mb-4">
            <AvatarWrapper image_url={user.data?.image_url} />

            <div className="flex flex-col">
              <p className="text-foreground font-medium text-sm">
                {user.data?.username}
              </p>
              <p className="text-muted-foreground text-xs">Admin</p>
            </div>
          </div>

          <Form {...form}>
            <form
              className="flex flex-col flex-1"
              onSubmit={form.handleSubmit(submitHandler)}
            >
              <div className="flex flex-col gap-4 flex-1">
                <FormField
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <Input placeholder="Group name" {...field} />
                    </FormItem>
                  )}
                />

                <FormField
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <Textarea
                        placeholder="What is this group about?"
                        {...field}
                      />
                    </FormItem>
                  )}
                />

                <FormField
                  name="privacy"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Privacy</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose privacy" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="public">Public</SelectItem>
                          <SelectItem value="private">Private</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  name="themePreset"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Theme</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a theme" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.values(groupThemes).map((t) => (
                            <SelectItem key={t} value={t}>
                              {t}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>
              <Button disabled={!form.formState.isValid || create.isPending}>
                Create group
              </Button>
            </form>
          </Form>
        </header>
        <section className="p-10 overflow-auto">
          <section className="bg-card p-4 rounded-xl max-w-6xl mx-auto">
            <p className="font-bold mb-4">Preview</p>
            <div className="border-border border-b pb-4 mb-4">
              <header
                className={`h-[400px] w-full rounded-lg ${
                  getTheme(themeWatch).gradientClass
                } mx-auto flex items-center mb-6`}
              ></header>
              <h2 className="text-4xl font-bold text-foreground mb-4">
                {nameWatch}
              </h2>
              <p className="text-muted-foreground text-sm max-w-3xl leading-normal mb-2">
                {descriptionWatch}
              </p>
              <GroupPrivacyChip type={privacyWatch} />
            </div>

            <div className="flex justify-between">
              <div className="flex gap-2">
                <p className="py-2 px-4 text-foreground">Home</p>
                <p className="py-2 px-4 text-foreground">About</p>
              </div>

              <button
                type="button"
                aria-label="Inactive button used for an example ui piece"
                className={`${buttonVariants({ variant: "default" })}`}
                style={{
                  backgroundColor: getTheme(themeWatch).color,
                }}
              >
                Join group
              </button>
            </div>
          </section>
        </section>
      </section>
    </main>
  );
};

export default NewGroup;
