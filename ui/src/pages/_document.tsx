import { Html, Head, Main, NextScript } from "next/document";
import { PublicEnvScript } from "next-runtime-env";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <PublicEnvScript />
      </Head>
      <body className="font-sans bg-background">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
