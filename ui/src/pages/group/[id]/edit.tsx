import Header from "@/components/Header";
import { H1, H2 } from "@/components/Heading";
import { Button } from "@/components/ui/button";
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
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useGroup } from "@/hooks/useGroup";
import { themeMap } from "@/lib/mapTheme";
import {
  EditGroupSchema,
  NewGroupSchema,
  ThemeMap,
  newGroupSchema,
} from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import clsx from "clsx";
import { CircleCheck, Globe, Lock, ShieldX } from "lucide-react";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

const Edit = () => {
  const router = useRouter();
  const { group, update } = useGroup({
    id: router.query.id as string,
  });

  const form = useForm<EditGroupSchema>({
    resolver: zodResolver(newGroupSchema),
  });

  const groupData = group.data?.group;

  useEffect(() => {
    if (!group.data?.group) return;

    form.reset(group.data.group);
  }, [group.data, group.isLoading]);

  if (group.isLoading || !group.data) return null;

  /**
   * Whether or not require mod approval before allowing posts
   *
   * @param {boolean} type - The type of moderation to perform.
   * @return {void} This function does not return a value.
   */
  const postModHandler = (type: boolean) => {
    if (!group.data) return;
    if (type) {
      form.setValue("moderation.approvePosts", type);
    }

    return form.setValue("moderation.approvePosts", type);
  };

  const submitHandler = (data: EditGroupSchema) => {
    const payload: EditGroupSchema = {
      ...group.data,
      ...data,
      theme: themeMap[data.theme.color] ?? themeMap.default,
    };

    update.mutate(payload, {
      onSuccess: () => {
        form.reset();
        toast.success("Group updated");
      },
    });
  };

  const themeChangeHandler = (data: string) => {
    form.setValue("theme", themeMap[data] ?? themeMap.default);
  };

  return (
    <main>
      <Header />

      <section className="max-w-screen-md mx-auto my-10">
        <H1>Editing {groupData?.name}</H1>

        <Form {...form}>
          <form
            className="flex flex-col gap-4 mt-10"
            onSubmit={form.handleSubmit(submitHandler)}
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
              name="privacy"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Privacy</FormLabel>

                  <Select
                    defaultValue={groupData?.privacy}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a privacy" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="private">Private</SelectItem>
                      <SelectItem value="public">Public</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            <FormField
              name="theme.color"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Theme</FormLabel>
                  <div className="flex gap-3">
                    <div
                      className={clsx(
                        "h-10 w-10 rounded-md",
                        themeMap[field.value]?.gradientClass
                      )}
                    ></div>
                    <Select
                      defaultValue={field.value}
                      onValueChange={themeChangeHandler}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a theme" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(themeMap).map((value) => (
                          <SelectItem key={value.color} value={value.color}>
                            {value.color}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </FormItem>
              )}
            />

            <Separator className="my-4" />

            <H2>Moderation</H2>

            <section className="flex flex-col gap-10">
              <div>
                <h3 className="font-medium mb-4">New members</h3>

                <div className="flex border border-border rounded-lg p-4 bg-card">
                  {groupData?.privacy === "private" ? (
                    <div>
                      <p className="font-medium flex gap-2 items-baseline">
                        <Lock size={18} />
                        Your group is private
                      </p>
                      <p className="text-muted-foreground text-xs">
                        New members will have to ask for approval to join your
                        group. Change your privacy to Public in order to allow
                        anyone to join.
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="font-medium flex gap-2 items-baseline">
                        <Globe size={18} />
                        Your group is public
                      </p>
                      <p className="text-muted-foreground text-xs">
                        Anyone can join your group.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-4">Posts</h3>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    className={clsx(
                      "flex border border-border rounded-lg items-center p-4 bg-card text-foreground/50",
                      form.watch("moderation.approvePosts") &&
                        "bg-primary/10 border-primary text-primary"
                    )}
                    onClick={() => postModHandler(true)}
                  >
                    <p className="flex gap-6 items-center text-left">
                      <ShieldX />
                      Approve posts before they are visible
                    </p>
                  </button>
                  <button
                    type="button"
                    className={clsx(
                      "flex border border-border rounded-lg items-center p-4 bg-card text-foreground/50",
                      !form.watch("moderation.approvePosts") &&
                        "bg-primary/10  border-primary text-primary"
                    )}
                    onClick={() => postModHandler(false)}
                  >
                    <p className="flex gap-6 items-center text-left">
                      <CircleCheck />
                      Allow posts to be public without approval
                    </p>
                  </button>
                </div>
              </div>
            </section>
            <Button className="mt-10">Save changes</Button>
          </form>
        </Form>
      </section>
    </main>
  );
};

export default Edit;
