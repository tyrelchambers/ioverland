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
import { useState } from "react";
import { Label } from "./ui/label";

export const CommentInput = ({
  buildId,
  replyId,
  placeholder,
  closeReply,
}: {
  buildId: string;
  replyId?: string;
  placeholder?: string;
  closeReply?: () => void;
}) => {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const { post } = useComments({
    buildId,
    replyId,
  });

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
    <div className="max-w-3xl">
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
                      placeholder={
                        placeholder ?? "What do you think about this build?"
                      }
                      className="border-0"
                      {...field}
                    />
                    <FormMessage />
                  </div>
                </div>
              </FormItem>
            )}
          />
          <div className="mt-6 flex justify-between bg-card p-3 items-center">
            <Avatar className="w-6 h-6 mr-2">
              <AvatarImage src={user?.imageUrl} />
            </Avatar>
            <div className="flex gap-3">
              {replyId && (
                <Button size="lg" variant="outline" onClick={closeReply}>
                  Cancel
                </Button>
              )}
              <Button
                size="lg"
                disabled={!isSignedIn || !form.getValues("comment")}
              >
                Post
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};

export const CommentList = ({ comments }: { comments: IComment[] }) => {
  return (
    <div className="flex flex-col">
      {comments.map((c) => (
        <Comment key={c.uuid} c={c} />
      ))}
    </div>
  );
};

export const Comment = ({ c }: { c: IComment }) => {
  const [openReply, setOpenReply] = useState(false);
  const { likeComment, dislikeComment } = useComments({ buildId: c.build_id });
  const { isSignedIn } = useUser();

  const isLiked = c.likes?.includes(c.author?.uuid ?? "");

  return (
    <div className="flex flex-col">
      <div className=" p-6 flex  gap-4">
        <div className="w-[18px] flex flex-col items-center mt-1 ">
          {isLiked ? (
            <Button
              size="slim"
              type="button"
              variant="link"
              onClick={() => dislikeComment.mutate({ comment_id: c.uuid })}
              disabled={!isSignedIn}
            >
              <ArrowUpCircle className="text-primary" size={18} />
            </Button>
          ) : (
            <Button
              size="slim"
              type="button"
              variant="link"
              onClick={() => likeComment.mutate({ comment_id: c.uuid })}
              disabled={!isSignedIn}
            >
              <ArrowUpCircle className="text-foreground " size={18} />
            </Button>
          )}
          <p className="text-xs mt-2 font-bold">{c.likes?.length ?? 0}</p>
        </div>

        <div className="flex flex-col w-full">
          <p className="text-foreground whitespace-pre-wrap">{c.text}</p>

          <footer className="mt-2">
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
              {!c.reply_id && (
                <>
                  <Dot className="text-muted-foreground/50" />
                  <button
                    type="button"
                    className="underline text-sm text-muted-foreground"
                    onClick={() => setOpenReply(!openReply)}
                  >
                    Reply
                  </button>
                </>
              )}
            </div>
          </footer>
          {openReply && (
            <div className="mt-6">
              <p className="mb-2 text-muted-foreground text-sm font-bold">
                Replying to {c.author.username}
              </p>
              <CommentInput
                buildId={c.build_id}
                replyId={c.uuid}
                placeholder={`Say something nice to ${c.author.username}`}
                closeReply={() => setOpenReply(false)}
              />
            </div>
          )}
        </div>
      </div>
      {c.replies?.length && c.replies.length > 0 ? (
        <div className="flex flex-col gap-4">
          {c.replies?.map((rep) => (
            <Reply r={rep} key={rep.uuid} />
          ))}
        </div>
      ) : null}
    </div>
  );
};

const Reply = ({ r }: { r: IComment }) => {
  const { likeComment, dislikeComment } = useComments({
    buildId: r.build_id,
  });
  const { isSignedIn } = useUser();

  const isLiked = r.likes?.includes(r.author?.uuid ?? "");
  return (
    <div className="rounded-xl flex  gap-4  ml-20" key={r.uuid}>
      <div className="w-[18px] flex flex-col items-center mt-1 ">
        {isLiked ? (
          <Button
            size="slim"
            type="button"
            variant="link"
            onClick={() => dislikeComment.mutate({ comment_id: r.uuid })}
            disabled={!isSignedIn}
          >
            <ArrowUpCircle className="text-primary" size={18} />
          </Button>
        ) : (
          <Button
            size="slim"
            type="button"
            variant="link"
            onClick={() => likeComment.mutate({ comment_id: r.uuid })}
            disabled={!isSignedIn}
          >
            <ArrowUpCircle className="text-foreground " size={18} />
          </Button>
        )}
        <p className="text-xs mt-2 font-bold">{r.likes?.length ?? 0}</p>
      </div>

      <div className="flex flex-col w-full">
        <p className="text-foreground whitespace-pre-wrap">{r.text}</p>

        <footer className="mt-2">
          <div className="flex items-center ">
            <Avatar className="w-6 h-6 mr-2">
              <AvatarImage src={r.author?.image_url} />
            </Avatar>
            <p className="text-muted-foreground text-sm">
              {r.author?.username}
            </p>
            <Dot className="text-muted-foreground/50" />
            <p className="text-muted-foreground text-sm">
              {formatDistanceToNowStrict(r.created_at, {
                addSuffix: true,
              })}
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};
