import "@/styles/globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import type { AppProps } from "next/app";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Playfair_Display, Mulish } from "next/font/google";
import "filepond/dist/filepond.min.css";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";
import { Toaster } from "@/components/ui/sonner";
import { config } from "@/config";

export const headingFont = Playfair_Display({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-heading",
});
export const paragraphFont = Mulish({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-paragraph",
});

const queryClient = new QueryClient();

export default function App({ Component, pageProps }: AppProps) {
  console.log(process.env.NEXT_PUBLIC_BACKEND_URL);

  return (
    <ClerkProvider publishableKey={config.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
      <QueryClientProvider client={queryClient}>
        <Component {...pageProps} />
        <Toaster richColors />

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
