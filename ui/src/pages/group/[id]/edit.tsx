import Header from "@/components/Header";
import { H1, H2 } from "@/components/Heading";
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
import { NewGroupSchema, newGroupSchema } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/router";
import React from "react";
import { useForm } from "react-hook-form";

const Edit = () => {
  const router = useRouter();
  const { group } = useGroup({
    id: router.query.id as string,
  });

  const form = useForm<NewGroupSchema>({
    resolver: zodResolver(newGroupSchema),
    defaultValues: group.data,
  });

  if (group.isLoading) return null;

  return (
    <main>
      <Header />

      <section className="max-w-screen-md mx-auto my-10">
        <H1>Editing {group.data?.name}</H1>

        <Form {...form}>
          <form className="flex flex-col gap-4 mt-10">
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
                    defaultValue={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger>
                      <FormControl>
                        <SelectValue placeholder="Select a privacy" />
                      </FormControl>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="private">Private</SelectItem>
                      <SelectItem value="public">Public</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <Separator className="my-4" />

            <H2>Moderation</H2>

            <section>
              <h3 className="font-medium">New members</h3>
            </section>
          </form>
        </Form>
      </section>
    </main>
  );
};

export default Edit;
