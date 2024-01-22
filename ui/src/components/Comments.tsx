import { useForm } from "react-hook-form";
import { Form, FormField, FormItem, FormMessage } from "./ui/form";
import { useAuth, useUser } from "@clerk/nextjs";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useComments } from "@/hooks/useComments";
import { IComment, newComment } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowUpCircle, Dot, UserIcon } from "lucide-react";
import { formatDistanceToNowStrict } from "date-fns";
import { useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import DeletedComment from "./DeletedComment";

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
        if (closeReply) {
          closeReply();
        }
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
              <AvatarFallback>
                <UserIcon size={14} />
              </AvatarFallback>
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
    <div className="flex flex-col gap-3">
      {comments.map((c) => (
        <Comment key={c.uuid} c={c} />
      ))}
    </div>
  );
};

export const Comment = ({ c }: { c: IComment }) => {
  const [openReply, setOpenReply] = useState(false);
  const { likeComment, dislikeComment, deleteComment } = useComments({
    buildId: c.build_id,
  });
  const { isSignedIn, user } = useUser();

  const isLiked = c.likes?.includes(c.author?.uuid ?? "");
  const canDelete =
    user?.id === c.author?.uuid || user?.id === c.build?.user_id;

  return (
    <div className="flex flex-col gap-3">
      {!c.deleted ? (
        <div className="py-6 flex  gap-4">
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
            <p className="text-card-foreground whitespace-pre-wrap bg-card p-3 rounded-md">
              {c.text}
            </p>

            <footer className="mt-2">
              <div className="flex items-center ">
                <Avatar className="w-6 h-6 mr-2">
                  <AvatarImage src={c.author?.image_url} />
                  <AvatarFallback>
                    <UserIcon size={14} />
                  </AvatarFallback>
                </Avatar>
                <p className="text-muted-foreground text-sm hidden md:inline">
                  {c.author?.username}
                </p>
                <Dot className="text-muted-foreground/50" />
                <p className="text-muted-foreground text-sm">
                  {formatDistanceToNowStrict(c.created_at, { addSuffix: true })}
                </p>
                {!c.reply_id && isSignedIn && (
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
                {canDelete && (
                  <>
                    <Dot className="text-muted-foreground/50" />

                    <Delete
                      deleteHandler={() =>
                        deleteComment.mutate({ comment_id: c.uuid })
                      }
                    />
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
      ) : (
        <DeletedComment />
      )}
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
  const { likeComment, dislikeComment, deleteComment } = useComments({
    buildId: r.build_id,
  });
  const { isSignedIn, user } = useUser();

  const isLiked = r.likes?.includes(r.author?.uuid ?? "");
  const canDelete =
    user?.id === r.author?.uuid || user?.id === r.build?.user_id;

  if (r.deleted) return <DeletedComment isReply />;

  return (
    <div className="rounded-xl flex  gap-4  md:ml-20 ml-6" key={r.uuid}>
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
        <p className="text-card-foreground whitespace-pre-wrap bg-card p-3 rounded-md">
          {r.text}
        </p>

        <footer className="mt-2">
          <div className="flex items-center ">
            <Avatar className="w-6 h-6 mr-2">
              <AvatarImage src={r.author?.image_url} />
              <AvatarFallback>
                <UserIcon size={14} />
              </AvatarFallback>
            </Avatar>
            <p className="text-muted-foreground text-sm hidden md:flex">
              {r.author?.username}
            </p>
            <Dot className="text-muted-foreground/50" />
            <p className="text-muted-foreground text-sm">
              {formatDistanceToNowStrict(r.created_at, {
                addSuffix: true,
              })}
            </p>
            {canDelete && (
              <>
                <Dot className="text-muted-foreground/50" />

                <Delete
                  deleteHandler={() =>
                    deleteComment.mutate({ comment_id: r.uuid })
                  }
                />
              </>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
};

export const Delete = ({ deleteHandler }: { deleteHandler: () => void }) => {
  return (
    <Dialog>
      <DialogTrigger className="text-muted-foreground text-sm underline">
        Delete
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete comments</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this comment?
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <DialogClose>
            <Button variant="outline" type="button">
              Don&apos;t delete
            </Button>
          </DialogClose>
          <Button variant="destructive" type="button" onClick={deleteHandler}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
