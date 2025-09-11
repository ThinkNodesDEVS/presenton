"use client";

import { useState } from "react";
import { BillingApi } from "@/app/(presentation-generator)/services/api/billing";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import DashboardHeader from "@/app/(presentation-generator)/dashboard/components/Header";

export default function PricingPage() {
  const [interval, setInterval] = useState<"month" | "year">("month");
  const [loading, setLoading] = useState<string | null>(null);
  const router = useRouter();

  const startCheckout = async (plan: "starter" | "pro") => {
    try {
      setLoading(plan);
      const url = await BillingApi.startCheckout(plan, interval);
      window.location.href = url;
    } catch {
      setLoading(null);
    }
  };

  const price = (m: number, y: number) => (interval === "month" ? `$${m}/mo` : `$${y}/yr`);

  return (
    <div className="relative min-h-screen bg-[#E9E8F8]">
      <DashboardHeader />
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -top-24 left-1/2 h-[480px] w-[960px] -translate-x-1/2 rounded-full bg-gradient-to-r from-[#9FE7F1]/40 via-[#E6FAFD]/30 to-transparent blur-3xl" />
        <div className="absolute -bottom-24 right-1/2 h-[420px] w-[820px] translate-x-1/2 rounded-full bg-gradient-to-tr from-[#D4F2F7]/50 via-[#EAFBFF]/30 to-transparent blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 py-14">
        <div className="mx-auto mb-8 max-w-2xl text-center">
          <h1 className="text-4xl font-bold text-deep-navy md:text-5xl">Simple, transparent pricing</h1>
          <p className="mt-3 text-md text-medium-gray">Choose the plan that fits your team's presentation workflow.</p>
        </div>

        <div className="mx-auto mb-10 flex w-full max-w-md items-center justify-center rounded-full bg-white p-1 shadow-sm ring-1 ring-deep-navy/5">
          <button
            onClick={() => setInterval("month")}
            className={`w-1/2 rounded-full px-4 py-2 text-sm font-medium transition ${interval === "month" ? "bg-deep-navy text-white shadow-sm" : "text-deep-navy/70"}`}
          >
            Monthly
          </button>
          <button
            onClick={() => setInterval("year")}
            className={`w-1/2 rounded-full px-4 py-2 text-sm font-medium transition ${interval === "year" ? "bg-deep-navy text-white shadow-sm" : "text-deep-navy/70"}`}
          >
            Annual (2 months free)
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Starter */}
          <div className="group relative rounded-2xl border border-deep-navy/10 bg-white p-6 shadow transition hover:shadow-lg">
            <h2 className="text-lg font-semibold text-deep-navy">Starter</h2>
            <p className="mt-2 text-4xl font-bold text-deep-navy">{price(12, 120)}</p>
            <p className="mt-1 text-xs text-medium-gray">Everything you need to start</p>
            <ul className="mt-6 space-y-3 text-sm text-deep-navy/80">
              <li className="flex items-start gap-2"><span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-[#05A4BD]" />30 slides included/month</li>
              <li className="flex items-start gap-2"><span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-[#05A4BD]" />3 image + 3 text regenerations per slide</li>
              <li className="flex items-start gap-2"><span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-[#05A4BD]" />Export to PPTX & PDF</li>
            </ul>
            <button
              onClick={() => startCheckout("starter")}
              disabled={loading === "starter"}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#066678] to-[#005264] px-4 py-3 font-semibold text-white ring-1 ring-black/0 transition hover:shadow-lg disabled:opacity-50"
            >
              {loading === "starter" ? (<><Loader2 className="animate-spin" size={18} /> Redirecting...</>) : "Get Starter"}
            </button>
          </div>

          {/* Pro */}
          <div className="group relative rounded-2xl border-2 border-[#066678] bg-white p-6 shadow-md transition hover:shadow-xl">
            <div className="absolute right-6 top-6 rounded-full bg-[#066678] px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">Most Popular</div>
            <h2 className="text-lg font-semibold text-deep-navy">Pro</h2>
            <p className="mt-2 text-4xl font-bold text-deep-navy">{price(39, 390)}</p>
            <p className="mt-1 text-xs text-medium-gray">For teams creating at scale</p>
            <ul className="mt-6 space-y-3 text-sm text-deep-navy">
              <li className="flex items-start gap-2"><span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-[#066678]" />150 slides included/month</li>
              <li className="flex items-start gap-2"><span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-[#066678]" />3 image + 3 text regenerations per slide</li>
              <li className="flex items-start gap-2"><span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-[#066678]" />Export to PPTX & PDF</li>
            </ul>
            <button
              onClick={() => startCheckout("pro")}
              disabled={loading === "pro"}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#066678] to-[#005264] px-4 py-3 font-semibold text-white transition hover:shadow-lg disabled:opacity-50"
            >
              {loading === "pro" ? (<><Loader2 className="animate-spin" size={18} /> Redirecting...</>) : "Get Pro"}
            </button>
          </div>
        </div>

        <p className="mx-auto mt-10 max-w-3xl text-center text-md text-medium-gray">
          Free: 2 presentations total; 5 slides/month (personal email) or 10 slides/month (work email).
        </p>
      </div>
    </div>
  );
}



