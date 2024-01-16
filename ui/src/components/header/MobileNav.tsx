import React from "react";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { SignedIn, SignedOut } from "@clerk/clerk-react";
import { Button } from "../ui/button";
import { Route } from "@/types";
import { cn } from "@/lib/utils";
import { Separator } from "../ui/separator";
import { dashboardTabs } from "@/index.routes";

const MobileNav = ({
  routes,
  authRoutes,
}: {
  routes: Route[];
  authRoutes: Route[];
}) => {
  const [open, setOpen] = React.useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger>
        <div className="w-[20px] h-[15px] flex flex-col gap-1">
          <span className="w-full h-[2px] bg-foreground"></span>
          <span className="w-full h-[2px] bg-foreground"></span>
          <span className="w-1/2 h-[2px] bg-foreground"></span>
        </div>
      </SheetTrigger>
      <SheetContent className="w-full max-w-xl overflow-y-auto">
        <section className="mt-4">
          <div className="flex flex-col gap-3 mt-10">
            {routes.map((route) => (
              <Link
                href={route.href}
                key={route.label}
                className="flex gap-6 items-center bg-card p-2 px-4 rounded-md hover:text-primary"
                onClick={() => setOpen(false)}
              >
                {route.icon} {route.label}
              </Link>
            ))}

            <SignedIn>
              {authRoutes.map((route) => (
                <Link
                  href={route.href}
                  key={route.label}
                  className="flex gap-6 items-center bg-card p-2 px-4 rounded-md hover:text-primary"
                  onClick={() => setOpen(false)}
                >
                  {route.icon} {route.label}
                </Link>
              ))}
              <Separator />

              {dashboardTabs.map(({ icon: Icon, label, tab }) => (
                <Link
                  key={label}
                  href={`/dashboard/?tab=${tab}`}
                  className="flex gap-6 items-center p-2 px-4 rounded-md hover:text-primary"
                  onClick={() => setOpen(false)}
                >
                  <Icon size={18} className="mr-2" />
                  {label}
                </Link>
              ))}
              <Link
                href="/build/new"
                className="w-full block mt-6"
                onClick={() => setOpen(false)}
              >
                <Button className={cn("w-full")}>New build</Button>
              </Link>
            </SignedIn>
          </div>
          <SignedOut>
            <Link href="/sign-up" className="w-full block mt-6">
              <Button className="w-full" type="button">
                Sign up
              </Button>
            </Link>
          </SignedOut>
        </section>
      </SheetContent>
    </Sheet>
  );
};

export default MobileNav;
