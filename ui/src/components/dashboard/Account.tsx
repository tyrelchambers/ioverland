import { format } from "date-fns";
import { Zap, Check, Calendar } from "lucide-react";
import React from "react";
import { H3 } from "../Heading";
import { Button } from "../ui/button";
import {
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
  Drawer,
} from "../ui/drawer";
import { useDomainUser } from "@/hooks/useDomainUser";
import { env } from "next-runtime-env";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";

const Account = () => {
  const {
    account: { data: account },
    createPortal,
    deleteUser,
    restoreUser,
    createCheckoutLink,
  } = useDomainUser();
  const getPortalLink = async () => {
    const data = await createPortal.mutateAsync();

    window.location.href = data.url;
  };

  const deleteHandler = () => {
    deleteUser.mutate();
  };

  const restoreHandler = () => {
    restoreUser.mutate();
  };

  const getCheckoutLink = async () => {
    const data = await createCheckoutLink.mutateAsync({
      redirect_to: `${env("NEXT_PUBLIC_FRONTEND_URL")}/dashboard?tab=account`,
    });

    if (data.url) {
      window.location.href = data.url;
    }
  };
  return (
    <>
      <section className="mb-10 w-full max-w-2xl">
        <H3>Builds</H3>
        <p className="text-muted-foreground">
          This is the number of builds you&apos;ve created according to your
          plan type.{" "}
          {account?.has_subscription &&
            "You have can have up to 5 builds since you are on the Pro plan."}
        </p>

        <div className="p-6 rounded-xl border border-border mt-6">
          <p className="text-muted-foreground">
            You have{" "}
            <span className="font-black text-foreground">
              {account?.total_builds} builds
            </span>{" "}
            in total. You also have{" "}
            <span className="font-black text-foreground">
              {account?.builds_remaining} builds remaining.
            </span>{" "}
          </p>

          {!account?.has_subscription && (
            <p className="text-muted-foreground text-sm mt-4 italic">
              Since you&apos;re on the free plan, you can only have one build.
              If you&apos;d like to create more, please sign up for the Pro
              subscription.
            </p>
          )}
        </div>
      </section>
      <Separator className="my-10" />
      <section className="w-full max-w-2xl">
        <H3>Subscription</H3>
        <p className="text-muted-foreground">
          Your subscription is managed by Stripe.
        </p>
        <p className="text-muted-foreground mt-2 bg-card p-2 rounded-md italic text-sm">
          Please keep in mind if you cancel your subscription, your builds will
          be made private except for the first one you created. You will be able
          to swap between which one build will be public.
        </p>

        {account?.has_subscription ? (
          <div className="mt-10 flex flex-col p-6 rounded-xl w-full bg-gradient-to-tr from-blue-900 to-blue-500 shadow-lg">
            <Zap className="text-white mb-4" />
            <p className="text-white text-xl">
              You are currently subscribed to the Pro plan!
            </p>
            <p className="text-white text-2xl my-4 font-black">
              ${account.subscription.price / 100}/month
            </p>
            <Badge variant="outline" className="text-sm  text-background w-fit">
              Next invoice date:{" "}
              {format(
                new Date(account.subscription.next_invoice_date),
                "MMMM dd, yyyy"
              )}
            </Badge>
            <Button
              type="button"
              variant="secondary"
              className="mt-3"
              onClick={getPortalLink}
            >
              Manage subscription
            </Button>
          </div>
        ) : (
          <div className="mt-10 flex flex-col p-6 rounded-xl w-full  bg-card ">
            <Zap className="text-muted-foreground" />
            <p className="font-bold mt-6">
              Not currently subscribed to any plan.
            </p>
            <p className="text-muted-foreground text-sm">
              If you&apos;d like to experience all iOverland has to offer,
              please purchase a plan.
            </p>
            <Separator className="mt-4" />
            <ul className=" flex flex-col gap-4 mt-4 text-sm">
              <li className="flex items-center gap-2 text-muted-foreground">
                <Check size={16} className="text-primary" />
                Multiple builds - up to 5
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Check size={16} className="text-primary" />
                Video support for your builds
              </li>
            </ul>
            <Drawer>
              <DrawerTrigger asChild>
                <Button className="mt-4">Subscribe to Pro</Button>
              </DrawerTrigger>
              <DrawerContent>
                <div className="max-w-[400px] w-full mx-auto">
                  <DrawerHeader>
                    <DrawerTitle>Choose a plan</DrawerTitle>
                    <DrawerDescription>
                      Paid on a monthly basis.
                    </DrawerDescription>
                  </DrawerHeader>
                  <div className="p-6 rounded-xl border-2 border-primary  m-4 shadow-lg">
                    <p className="mb-4 font-bold text-primary">Pro</p>
                    <p className="text-3xl font-bold">$10</p>
                    <Separator className="my-6" />
                    <p className="text-sm">Gives you access to:</p>
                    <ul className=" flex flex-col gap-4 mt-4 text-sm">
                      <li className="flex items-center gap-2 text-muted-foreground">
                        <Check size={16} className="text-primary" />
                        Multiple builds - up to 5
                      </li>
                      <li className="flex items-center gap-2 text-muted-foreground">
                        <Check size={16} className="text-primary" />
                        Video support for your builds
                      </li>
                    </ul>
                  </div>
                  <DrawerFooter>
                    <Button
                      type="button"
                      onClick={getCheckoutLink}
                      className="w-full"
                    >
                      Continue
                    </Button>
                    <DrawerClose className="text-muted-foreground">
                      Cancel
                    </DrawerClose>
                  </DrawerFooter>
                </div>
              </DrawerContent>
            </Drawer>
          </div>
        )}
      </section>
      <Separator className="my-10" />
      <H3>Delete account</H3>
      <p className="max-w-3xl text-muted-foreground">
        Tread lightly here. Delete your account forever. If you are subscribed
        to a plan, it will delete at the end of the billing cycle.
      </p>
      {account?.deleted_at && (
        <div className="bg-yellow-100 rounded-xl text-yellow-700 flex flex-col gap-2 overflow-hidden max-w-2xl w-full my-6 shadow-lg">
          <div className="flex flex-col gap-2 p-4">
            <p>Plan and account are set to delete on: </p>
            <p className="font-bold flex items-center">
              <Calendar className="mr-2" size={18} />
              {format(new Date(account.deleted_at), "MMMM dd, yyyy")}
            </p>
          </div>

          <footer className="bg-yellow-400 p-4 flex items-center justify-between">
            <p className="text-yellow-900">
              Want to cancel the deletion and keep your account and your plan?
            </p>

            <Button variant="secondary" onClick={restoreHandler}>
              {restoreUser.isPending ? "Restoring..." : "Restore"}
            </Button>
          </footer>
        </div>
      )}
      {!account?.deleted_at && (
        <Button
          variant="destructiveMuted"
          className="mt-6"
          onClick={deleteHandler}
          type="button"
        >
          {deleteUser.isPending ? "Deleting..." : "Delete account"}
        </Button>
      )}
    </>
  );
};

export default Account;
