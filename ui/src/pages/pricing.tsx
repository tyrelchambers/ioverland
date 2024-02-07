import Header from "@/components/Header";
import { H1 } from "@/components/Heading";
import PricingBlock from "@/components/PricingBlock";
import { plans } from "@/constants";
import Head from "next/head";
import React from "react";

const pricing = () => {
  return (
    <div>
      <Head>
        <title>Pricing | WildBarrens</title>
      </Head>
      <Header />

      <section className="max-w-screen-xl mx-auto">
        <header className="max-w-4xl mx-auto flex flex-col items-center my-16 p-4 lg:p-0">
          <H1 className="text-center mb-10">
            Designed to help you get the most out of your Overland adventures
          </H1>
          <p className="text-muted-foreground text-center md:text-xl text-sm text-balance">
            WildBarrens was made to give you a place to show-off your builds and
            document your trips. We hope WildBarrens is everything you&apos;d
            like in a place to showcase what you&apos;ve worked on.
          </p>
          <p className="text-muted-foreground text-center italic mt-6">
            All plans are paid monthly
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 p-4 lg:p-0 ">
          {plans.map((plan) => (
            <PricingBlock plan={plan} key={plan.name} useLink />
          ))}
        </div>
      </section>
    </div>
  );
};

export default pricing;
