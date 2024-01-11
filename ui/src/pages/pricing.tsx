import Header from "@/components/Header";
import { H1, H2 } from "@/components/Heading";
import { Button } from "@/components/ui/button";
import { cn, formatPrice } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";
import React from "react";

interface Plan {
  name: string;
  tagline: string;
  price: number;
  plan_name: string;
  features: string[];
  featured?: boolean;
}

const plans: Plan[] = [
  {
    name: "Free",
    tagline: "For hobbyists",
    price: 0,
    plan_name: "free",
    features: ["1 build", "6 images per build", "50MB per image"],
  },
  {
    name: "Overlander",
    tagline: "For seasoned Overlanders",
    price: 25,
    plan_name: "overlander",
    features: [
      "Unlimited builds",
      "25 images per build",
      "300MB per image or video",
      "Unlimited trips",
      "Overlander badge for your profile",
    ],
    featured: true,
  },
  {
    name: "Explorer",
    tagline: "For aspiring Overlanders",
    price: 15,
    plan_name: "explorer",
    features: [
      "5 builds",
      "16 images per build",
      "100MB per image or video",
      "Video support",
      "Document up to 5 trips",
      "Basic badge for your profile",
    ],
  },
];

const pricing = () => {
  return (
    <div>
      <Header />

      <section className="max-w-screen-xl mx-auto">
        <header className="max-w-4xl mx-auto flex flex-col items-center my-16 p-4 lg:p-0">
          <H1 className="text-center mb-10">
            Designed to help you get the most out of your Overland adventures
          </H1>
          <p className="text-muted-foreground text-center md:text-xl text-sm text-balance">
            iOverland was made to give you a place to show-off your builds and
            document your trips. We hope iOverland is everything you&apos;d like
            in a place to showcase what you&apos;ve worked on.
          </p>
          <p className="text-muted-foreground text-center italic mt-6">
            All plans are paid monthly
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 p-4 lg:p-0 ">
          {plans.map((plan) => (
            <PricingBlock plan={plan} key={plan.name} />
          ))}
        </div>
      </section>
    </div>
  );
};

const PricingBlock = ({ plan }: { plan: Plan }) => (
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
      <p className="font-black text-5xl my-4">
        ${plan.price}
        <span className="text-lg font-normal"></span>
      </p>
      <p className="text-xl text-muted-foreground">{plan.tagline}</p>
      <Button className="mt-6 w-full">Get Started</Button>
    </header>

    <section
      className={cn(
        "mt-10",
        plan.featured && "bg-primary p-6 rounded-lg shadow-xl relative z-10"
      )}
    >
      <ul className="flex flex-col gap-4">
        {plan.features.map((feature) => (
          <li
            key={feature}
            className={cn(
              "text-lg text-muted-foreground flex gap-6 items-center",
              plan.featured && "text-primary-foreground"
            )}
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

export default pricing;
