import type { Metadata } from "next";
import localFont from "next/font/local";
import { Roboto, Instrument_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { ClerkProvider } from "@clerk/nextjs";
import { ClerkLoaded } from "@clerk/nextjs";
import MixpanelInitializer from "./MixpanelInitializer";
import { LayoutProvider } from "./(presentation-generator)/context/LayoutContext";
import { Toaster } from "@/components/ui/sonner";
const inter = localFont({
  src: [
    {
      path: "./fonts/Inter.ttf",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-inter",
});

const instrument_sans = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-instrument-sans",
});

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-roboto",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://decky.ai"),
  title: "Decky - The AI Agent That Creates Impressive Presentations",
  description:
    "Create impressive presentations in minutes with Decky. Open-source AI presentation generator with custom layouts, multi-model support, and professional export options.",
  keywords: [
    "AI presentation generator",
    "Decky",
    "presentation AI agent",
    "data storytelling",
    "data visualization tool",
    "AI data presentation",
    "presentation generator",
    "data to presentation",
    "interactive presentations",
    "professional slides",
    "from idea to impressive",
  ],
  openGraph: {
    title: "Decky - The AI Agent That Creates Impressive Presentations",
    description:
      "Create impressive presentations in minutes with Decky. Open-source AI presentation generator with custom layouts, multi-model support, and professional export options.",
    url: "https://decky.ai",
    siteName: "Decky",
    images: [
      {
        url: "https://decky.ai/decky-feature-graphics.png",
        width: 1200,
        height: 630,
        alt: "Decky Logo",
      },
    ],
    type: "website",
    locale: "en_US",
  },
  alternates: {
    canonical: "https://decky.ai",
  },
  twitter: {
    card: "summary_large_image",
    title: "Decky - The AI Agent That Creates Impressive Presentations",
    description:
      "Create impressive presentations in minutes with Decky. Open-source AI presentation generator with custom layouts, multi-model support, and professional export options.",
    images: ["https://decky.ai/decky-feature-graphics.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${roboto.variable} ${instrument_sans.variable} antialiased`}
      >

        <ClerkProvider>
          <Providers>
            <MixpanelInitializer>
              <LayoutProvider>
                <ClerkLoaded>
                  {children}
                </ClerkLoaded>
              </LayoutProvider>
            </MixpanelInitializer>
          </Providers>
        </ClerkProvider>
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
