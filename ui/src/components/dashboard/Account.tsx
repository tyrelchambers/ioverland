import { format } from "date-fns";
import { Zap, Calendar } from "lucide-react";
import React from "react";
import { H3 } from "../Heading";
import { Button } from "../ui/button";
import { DrawerClose } from "../ui/drawer";
import { useDomainUser } from "@/hooks/useDomainUser";
import { env } from "next-runtime-env";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import PricingBlock from "../PricingBlock";
import { plans } from "@/constants";

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

  const getCheckoutLink = async (plan: string) => {
    const data = await createCheckoutLink.mutateAsync({
      redirect_to: `${env("NEXT_PUBLIC_FRONTEND_URL")}/dashboard?tab=account`,
      plan,
    });

    if (data) {
      window.location.href = data;
    }
  };
  return (
    <>
      <section className="mb-10 w-full max-w-2xl">
        <H3>Builds</H3>
        <p className="text-muted-foreground">
          This is the number of builds you&apos;ve created according to your
          plan type.
        </p>

        <div className="p-6 rounded-xl border border-border mt-6">
          <p className="text-muted-foreground">
            You have{" "}
            <span className="font-black text-foreground">
              {account?.total_builds} builds
            </span>{" "}
            in total.
            {account?.builds_remaining !== -1 && (
              <p>
                You also have{" "}
                <span className="font-black text-foreground">
                  {account?.builds_remaining} builds remaining.
                </span>{" "}
              </p>
            )}
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
              You are currently subscribed to the {account.subscription.name}{" "}
              plan!
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

            <Dialog>
              <DialogTrigger asChild>
                <Button className="mt-4">Choose a plan</Button>
              </DialogTrigger>
              <DialogContent className="max-w-[1280px]">
                <div className="max-w-[1280px] w-full mx-auto">
                  <DialogHeader>
                    <DialogTitle>Choose a plan</DialogTitle>
                    <DialogDescription>
                      Paid on a monthly basis.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 p-4 lg:p-0 mt-4">
                    {plans.map((plan) => (
                      <PricingBlock
                        plan={plan}
                        key={plan.name}
                        checkoutLink={getCheckoutLink}
                      />
                    ))}
                  </div>
                  <DialogFooter className="flex !flex-col items-center">
                    <DrawerClose asChild className="text-muted-foreground mt-4">
                      <Button type="button" variant="outline">
                        Cancel
                      </Button>
                    </DrawerClose>
                  </DialogFooter>
                </div>
              </DialogContent>
            </Dialog>
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
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="destructiveMuted" className="mt-6" type="button">
              Delete Account
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete account</DialogTitle>
              <DialogDescription>
                Delete your account forever. If you are subscribed to a plan, it
                will delete at the end of the billing cycle and you can use your
                account until then. Otherwise, it will delete instantly.
              </DialogDescription>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="button" onClick={deleteHandler}>
                  Delete
                </Button>
              </DialogFooter>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default Account;
