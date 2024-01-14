import React, { useEffect, useState } from "react";
import { H2, H3 } from "../Heading";
import Uploader from "../Uploader";
import { FilePondFile } from "filepond";
import { Label } from "../ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Trash, User } from "lucide-react";
import { useDomainUser } from "@/hooks/useDomainUser";
import { Form, FormField, FormItem, FormLabel } from "../ui/form";
import { useForm } from "react-hook-form";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Media, UpdateProfileWithBanner, updateProfile } from "@/types";
import { folderRoot } from "@/constants";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";

const Profile = () => {
  const { account, update, removeBanner } = useDomainUser();
  const { user } = useUser();

  const [banner, setBanner] = useState<FilePondFile[]>([]);

  const form = useForm({
    resolver: zodResolver(updateProfile),
    defaultValues: {
      bio: "",
    },
  });

  useEffect(() => {
    if (account.data) {
      form.reset({
        bio: account.data.user.bio,
      });
    }
  }, [account.data]);

  const submitHandler = (data: UpdateProfileWithBanner) => {
    if (!user?.id) return;

    if (banner[0]) {
      data.banner = {
        mime_type: banner[0].fileType,
        name: banner[0].filename,
        url: `https://ioverland.b-cdn.net/${folderRoot}/${user.id}/${banner[0].serverId}/${banner[0].filename}`,
        type: "profile_banner",
      } satisfies Omit<Media, "uuid">;
    }

    update.mutate(data);
  };

  const removeBannerHandler = () => {
    if (!account.data?.user.banner?.id) return;

    removeBanner.mutate({
      media_id: account.data?.user.banner?.id,
    });
  };

  return (
    <div className="max-w-screen-sm ">
      <H2 className="mb-10">Profile</H2>

      <div>
        {account.data?.user.banner ? (
          <div className="w-full aspect-video h-[250px] overflow-hidden rounded-xl relative">
            <Image
              src={account.data.user.banner.url}
              alt=""
              fill
              className="object-cover"
            />
            <Button
              type="button"
              variant="destructive"
              className="rounded-full absolute top-2 right-2"
              onClick={removeBannerHandler}
            >
              <Trash size={16} className="mr-3" />
              Remove
            </Button>
          </div>
        ) : (
          <div className="w-full aspect-video h-[250px] bg-gradient-to-t from-zinc-200 to-zinc-100 rounded-xl"></div>
        )}
        <div className="w-full flex justify-center -translate-y-1/2">
          <Avatar className="w-20 h-20 border-4 border-white  shadow-xl">
            <AvatarFallback>
              <User />
            </AvatarFallback>
            <AvatarImage src={user?.imageUrl} />
          </Avatar>
        </div>
      </div>
      <Separator />
      <Form {...form}>
        <form
          className="flex flex-col gap-4 mt-10"
          onSubmit={form.handleSubmit(submitHandler)}
        >
          <H3>Info</H3>

          <div className="flex flex-col">
            <FormLabel className="mb-2">Banner image</FormLabel>
            <Uploader
              type="profile_banner"
              onUpdate={setBanner}
              allowMultiple={false}
              maxFileSize="5MB"
              maxFiles={1}
            />
          </div>

          <FormField
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="bio">Bio</FormLabel>
                <Textarea {...field} />
              </FormItem>
            )}
          />
          <Button>Save profile</Button>
        </form>
      </Form>
    </div>
  );
};

export default Profile;
