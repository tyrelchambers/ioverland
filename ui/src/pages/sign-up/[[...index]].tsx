import { SignUp } from "@clerk/nextjs";
import { useRouter } from "next/router";
import React from "react";

const Page = () => {
  const { redirect_to } = useRouter().query;

  return (
    <section className="h-screen w-full flex justify-center items-center">
      <SignUp redirectUrl={(redirect_to as string) ?? null} />
    </section>
  );
};

export default Page;
