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
import BuildTotals, { BuildTotalsSkeleton } from "./BuildTotals";
import Subscription, { SubscriptionSekelton } from "./Subscription";
import NoSubscription from "./NoSubscription";

const Account = () => {
  const {
    account: { data: account, isLoading },
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

        {isLoading ? (
          <BuildTotalsSkeleton />
        ) : (
          <BuildTotals account={account} />
        )}
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

        {isLoading ? (
          <SubscriptionSekelton />
        ) : account?.has_subscription ? (
          <Subscription account={account} getPortalLink={getPortalLink} />
        ) : (
          <NoSubscription getCheckoutLink={getCheckoutLink} />
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
