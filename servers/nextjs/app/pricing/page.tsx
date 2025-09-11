"use client";

import { useState } from "react";
import { BillingApi } from "@/app/(presentation-generator)/services/api/billing";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

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
    <div className="relative min-h-screen overflow-hidden bg-[#0B2932]">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -top-40 left-1/2 h-[600px] w-[1200px] -translate-x-1/2 rounded-full bg-gradient-to-r from-[#0E6C7F]/30 via-[#05A4BD]/20 to-transparent blur-3xl" />
        <div className="absolute -bottom-48 right-1/2 h-[500px] w-[900px] translate-x-1/2 rounded-full bg-gradient-to-tr from-[#022731]/30 via-[#0E6C7F]/20 to-transparent blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 py-16">
        <div className="mx-auto mb-8 max-w-2xl text-center">
          <h1 className="bg-gradient-to-r from-white to-white/70 bg-clip-text text-4xl font-bold text-transparent md:text-5xl">Simple, transparent pricing</h1>
          <p className="mt-3 text-sm text-white/70">Choose the plan that fits your team's presentation workflow.</p>
        </div>

        <div className="mx-auto mb-10 flex w-full max-w-md items-center justify-center rounded-full bg-white/5 p-1 ring-1 ring-white/10">
          <button
            onClick={() => setInterval("month")}
            className={`w-1/2 rounded-full px-4 py-2 text-sm font-medium transition ${interval === "month" ? "bg-white text-[#0B2932] shadow" : "text-white/80"}`}
          >
            Monthly
          </button>
          <button
            onClick={() => setInterval("year")}
            className={`w-1/2 rounded-full px-4 py-2 text-sm font-medium transition ${interval === "year" ? "bg-white text-[#0B2932] shadow" : "text-white/80"}`}
          >
            Annual (2 months free)
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Starter */}
          <div className="group relative rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-2xl backdrop-blur transition hover:bg-white/[0.05]">
            <div className="absolute inset-0 -z-10 rounded-2xl opacity-0 blur-2xl transition group-hover:opacity-100" style={{background:"radial-gradient(circle at 20% 0%, rgba(5,164,189,0.15), transparent 40%)"}} />
            <h2 className="text-lg font-semibold text-white">Starter</h2>
            <p className="mt-2 text-4xl font-bold text-white">{price(12, 120)}</p>
            <p className="mt-1 text-xs text-white/60">Everything you need to start</p>
            <ul className="mt-6 space-y-3 text-sm text-white/80">
              <li className="flex items-start gap-2"><span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-[#05A4BD]" />30 slides included/month</li>
              <li className="flex items-start gap-2"><span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-[#05A4BD]" />3 image + 3 text regenerations per slide</li>
              <li className="flex items-start gap-2"><span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-[#05A4BD]" />Export to PPTX & PDF</li>
            </ul>
            <button
              onClick={() => startCheckout("starter")}
              disabled={loading === "starter"}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#05A4BD] to-[#0E6C7F] px-4 py-3 font-semibold text-white ring-1 ring-white/10 transition hover:shadow-[0_0_30px_rgba(5,164,189,0.35)] disabled:opacity-50"
            >
              {loading === "starter" ? (<><Loader2 className="animate-spin" size={18} /> Redirecting...</>) : "Get Starter"}
            </button>
          </div>

          {/* Pro */}
          <div className="group relative rounded-2xl border border-[#05A4BD]/50 bg-white/10 p-6 shadow-2xl backdrop-blur">
            <div className="absolute right-6 top-6 rounded-full bg-[#05A4BD] px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">Most Popular</div>
            <div className="absolute inset-0 -z-10 rounded-2xl opacity-60 blur-2xl" style={{background:"radial-gradient(circle at 80% 0%, rgba(5,164,189,0.25), transparent 40%)"}} />
            <h2 className="text-lg font-semibold text-white">Pro</h2>
            <p className="mt-2 text-4xl font-bold text-white">{price(39, 390)}</p>
            <p className="mt-1 text-xs text-white/70">For teams creating at scale</p>
            <ul className="mt-6 space-y-3 text-sm text-white">
              <li className="flex items-start gap-2"><span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-white" />150 slides included/month</li>
              <li className="flex items-start gap-2"><span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-white" />3 image + 3 text regenerations per slide</li>
              <li className="flex items-start gap-2"><span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-white" />Export to PPTX & PDF</li>
            </ul>
            <button
              onClick={() => startCheckout("pro")}
              disabled={loading === "pro"}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-white px-4 py-3 font-semibold text-[#0B2932] ring-1 ring-white/50 transition hover:shadow-[0_0_30px_rgba(255,255,255,0.25)] disabled:opacity-50"
            >
              {loading === "pro" ? (<><Loader2 className="animate-spin" size={18} /> Redirecting...</>) : "Get Pro"}
            </button>
          </div>
        </div>

        <p className="mx-auto mt-10 max-w-3xl text-center text-xs text-white/70">
          Free: 2 presentations total; 5 slides/month (personal email) or 10 slides/month (work email).
        </p>
      </div>
    </div>
  );
}



