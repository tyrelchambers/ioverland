import { Zap } from "lucide-react";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import PricingBlock from "../PricingBlock";
import { plans } from "@/constants";
import { DrawerClose } from "../ui/drawer";

const NoSubscription = ({
  getCheckoutLink,
}: {
  getCheckoutLink?: (plan: string) => void;
}) => {
  return (
    <div className="mt-10 flex flex-col p-6 rounded-xl w-full  bg-card ">
      <Zap className="text-muted-foreground" />
      <p className="font-bold mt-6">Not currently subscribed to any plan.</p>
      <p className="text-muted-foreground text-sm">
        If you&apos;d like to experience all WildBarrens has to offer, please
        purchase a plan.
      </p>

      <Dialog>
        <DialogTrigger asChild>
          <Button className="mt-4">Choose a plan</Button>
        </DialogTrigger>
        <DialogContent className="max-w-[1280px]">
          <div className="max-w-[1280px] w-full mx-auto">
            <DialogHeader>
              <DialogTitle>Choose a plan</DialogTitle>
              <DialogDescription>Paid on a monthly basis.</DialogDescription>
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
  );
};

export default NoSubscription;
