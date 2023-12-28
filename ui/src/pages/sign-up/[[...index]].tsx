import { SignUp } from "@clerk/nextjs";
import React from "react";

const Page = () => {
  return (
    <section className="h-screen w-full flex justify-center items-center">
      <SignUp afterSignUpUrl="onboard" />
    </section>
  );
};

export default Page;
