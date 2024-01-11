import { SignUp } from "@clerk/nextjs";
import { useRouter } from "next/router";
import React from "react";

const Page = () => {
  const { plan } = useRouter().query;

  return (
    <section className="h-screen w-full flex justify-center items-center">
      <SignUp afterSignUpUrl={`/sign-up/onboard?plan=${plan}`} />
    </section>
  );
};

export default Page;
