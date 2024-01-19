import { useForm } from "react-hook-form";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { useAuth, useUser } from "@clerk/nextjs";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { useDomainUser } from "@/hooks/useDomainUser";
import { Avatar, AvatarImage } from "./ui/avatar";
import { useComments } from "@/hooks/useComments";
import { IComment, newComment } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowUp,
  ArrowUpCircle,
  ChevronUp,
  CircleEllipsis,
  Dot,
} from "lucide-react";
import { format, formatDistanceToNowStrict } from "date-fns";

export const CommentInput = ({ buildId }: { buildId: string }) => {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const { post } = useComments(buildId);

  const form = useForm({
    resolver: zodResolver(newComment),
    defaultValues: {
      comment: "",
    },
    disabled: !isSignedIn,
  });

  const handleSubmit = async (data: z.infer<typeof newComment>) => {
    await post.mutateAsync(data, {
      onSuccess: () => {
        form.reset();
      },
    });
  };

  return (
    <div className="max-w-3xl  mt-6">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="border border-border rounded-xl overflow-hidden"
        >
          <FormField
            name="comment"
            render={({ field }) => (
              <FormItem className="p-2">
                <div className="flex w-full">
                  <div className="flex flex-col w-full">
                    <Textarea
                      placeholder="What do you think about this build?"
                      className="border-0"
                      {...field}
                    />
                    <FormMessage />
                  </div>
                </div>
              </FormItem>
            )}
          />
          <div className="mt-6 flex justify-between bg-card p-3">
            <Avatar className="mr-2">
              <AvatarImage src={user?.imageUrl} />
            </Avatar>
            <Button
              size="lg"
              disabled={!isSignedIn || !form.getValues("comment")}
            >
              Post
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export const CommentList = ({ comments }: { comments: IComment[] }) => {
  return comments.map((c) => <Comment key={c.uuid} c={c} />);
};

export const Comment = ({ c }: { c: IComment }) => {
  const { likeComment, dislikeComment } = useComments(c.build_id);

  const isLiked = c.likes?.includes(c.author?.uuid ?? "");

  return (
    <div className=" p-6 rounded-xl flex  gap-4">
      <div className="w-[18px] flex flex-col items-center mt-1 ">
        {isLiked ? (
          <Button
            size="slim"
            type="button"
            variant="link"
            onClick={() => dislikeComment.mutate({ comment_id: c.uuid })}
          >
            <ArrowUpCircle className="text-primary" size={18} />
          </Button>
        ) : (
          <Button
            size="slim"
            type="button"
            variant="link"
            onClick={() => likeComment.mutate({ comment_id: c.uuid })}
          >
            <ArrowUpCircle className="text-foreground " size={18} />
          </Button>
        )}
        <p className="text-xs mt-2 font-bold">{c.likes?.length ?? 0}</p>
      </div>

      <div className="flex flex-col">
        <p className="text-foreground whitespace-pre-wrap">{c.text}</p>

        <footer className="mt-4">
          <div className="flex items-center ">
            <Avatar className="w-6 h-6 mr-2">
              <AvatarImage src={c.author?.image_url} />
            </Avatar>
            <p className="text-muted-foreground text-sm">
              {c.author?.username}
            </p>
            <Dot className="text-muted-foreground/50" />
            <p className="text-muted-foreground text-sm">
              {formatDistanceToNowStrict(c.created_at, { addSuffix: true })}
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};
