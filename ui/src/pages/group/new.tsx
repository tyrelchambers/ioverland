import Header from "@/components/Header";
import { AvatarWrapper } from "@/components/ui/avatar";
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
import { useDomainUser } from "@/hooks/useDomainUser";
import { newGroupSchema } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";

const NewGroup = () => {
  const { user } = useDomainUser();

  const form = useForm({
    resolver: zodResolver(newGroupSchema),
    defaultValues: {
      name: "",
      privacy: "",
    },
  });

  return (
    <main>
      <Header />

      <section className="grid grid-cols-[300px_1fr] ">
        <header className=" flex flex-col p-4 border-border border-r h-[calc(100vh-100px)]">
          <h1 className="text-2xl font-bold mb-8">Create group</h1>

          <div className="flex items-center gap-4 bg-card p-2 rounded-md mb-6">
            <AvatarWrapper image_url={user.data?.image_url} />

            <div className="flex flex-col">
              <p className="text-foreground font-medium text-sm">
                {user.data?.username}
              </p>
              <p className="text-muted-foreground text-xs">Admin</p>
            </div>
          </div>

          <Form {...form}>
            <form className="flex flex-col flex-1">
              <div className="flex flex-col gap-6 flex-1">
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
                            <SelectValue placeholder="Select a verified email to display" />
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
              </div>
              <Button>Create group</Button>
            </form>
          </Form>
        </header>

        <section>body</section>
      </section>
    </main>
  );
};

export default NewGroup;
