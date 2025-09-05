import React from "react";

import UploadPage from "./components/UploadPage";
import Header from "@/app/(presentation-generator)/dashboard/components/Header";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Decky | AI Presentation Generator",
  description:
    "Create impressive presentations in minutes with Decky. Open-source AI presentation generator with custom layouts, multi-model support, and professional export options.",
  alternates: {
    canonical: "https://decky.saleparrot.com",
  },
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
    title: "Create Data Presentation | Decky",
    description:
      "Create impressive presentations in minutes with Decky. Open-source AI presentation generator with custom layouts, multi-model support, and professional export options.",
    type: "website",
    url: "https://decky.saleparrot.com",
    siteName: "Decky",
  },
};

const page = () => {
  return (
    <div className="relative">
      <Header />
      <div className="flex flex-col items-center justify-center  py-8">
        <h1 className="text-3xl font-semibold font-instrument_sans">
          Create Presentation{" "}
        </h1>
        {/* <p className='text-sm text-gray-500'>We will generate a presentation for you</p> */}
      </div>

      <UploadPage />
    </div>
  );
};

export default page;
