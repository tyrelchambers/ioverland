import { SignUp } from "@clerk/nextjs";
import { useRouter } from "next/router";
import React from "react";

const Page = () => {
  const { plan } = useRouter().query;

  const signUpUrl = plan ? `/sign-up/onboard?plan=${plan}` : null;
  return (
    <section className="h-screen w-full flex justify-center items-center">
      <SignUp afterSignUpUrl={signUpUrl} />
    </section>
  );
};

export default Page;
