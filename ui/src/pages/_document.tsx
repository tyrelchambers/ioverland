import { Html, Head, Main, NextScript } from "next/document";
import { PublicEnvScript } from "next-runtime-env";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <PublicEnvScript />
        <link rel="icon" type="image/jpg" href="/favicon.jpg" />

        <script
          defer
          data-domain="iover.land"
          src="https://plausible.io/js/script.js"
        ></script>
      </Head>
      <body className="font-sans bg-background">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
