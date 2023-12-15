import "@/styles/globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import type { AppProps } from "next/app";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Carter_One, Mulish } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
export const headingFont = Carter_One({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-heading",
});
export const paragraphFont = Mulish({
  weight: ["300", "400", "700"],
  subsets: ["latin"],
  variable: "--font-paragraph",
});

const queryClient = new QueryClient();

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ClerkProvider>
      <QueryClientProvider client={queryClient}>
        <Component {...pageProps} />
        <Toaster />

        <style jsx global>
          {`
            :root {
              --font-sans: ${paragraphFont.style.fontFamily};
              --font-serif: ${headingFont.style.fontFamily};
            }
          `}
        </style>
      </QueryClientProvider>
    </ClerkProvider>
  );
}
