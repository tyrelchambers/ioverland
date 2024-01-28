import { cn } from "@/lib/utils";
import { Plan } from "@/types";
import React from "react";
import { H2 } from "./Heading";
import Link from "next/link";
import { Button } from "./ui/button";
import { CheckCircle2 } from "lucide-react";

const PricingBlock = ({
  plan,
  checkoutLink,
  useLink,
}: {
  plan: Plan;
  checkoutLink?: (plan: string) => void;
  useLink?: boolean;
}) => (
  <div
    className={cn(
      "border border-border rounded-lg p-6 py-10",
      plan.featured && "border-primary featured-pricing relative"
    )}
  >
    <header className="flex flex-col items-center w-full relative z-10">
      {plan.featured && (
        <p className="bg-primary text-primary-foreground rounded-full px-4 py-1.5 text-xs font-bold mb-3">
          For the best Overlanders
        </p>
      )}
      <H2 className="text-xl">{plan.name}</H2>
      <p className="font-black text-5xl my-4">${plan.price}</p>
      <p className="text-xl text-muted-foreground">{plan.tagline}</p>
      {useLink ? (
        <Link href={plan.redirect_link} className="w-full">
          <Button className="mt-6 w-full">Get Started</Button>
        </Link>
      ) : (
        <Button
          className="mt-6 w-full"
          onClick={() => checkoutLink && checkoutLink(plan.plan_id || "")}
        >
          Get Started
        </Button>
      )}
    </header>

    <section className={cn("mt-10")}>
      <ul className="flex flex-col gap-4">
        {plan.features.map((feature) => (
          <li
            key={feature}
            className={cn(" text-muted-foreground flex gap-6 items-center")}
          >
            <span className="w-[18px]">
              <CheckCircle2 size={18} />
            </span>
            <p className="font-medium">{feature}</p>
          </li>
        ))}
      </ul>
    </section>
  </div>
);

export default PricingBlock;
