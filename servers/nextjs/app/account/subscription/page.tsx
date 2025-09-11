"use client";

import { useEffect, useState } from "react";
import { BillingApi } from "@/app/(presentation-generator)/services/api/billing";
import Link from "next/link";
import { Loader2, Minus } from "lucide-react";

type Usage = {
  slides_used: number;
  slides_monthly_max: number;
  presentations_used: number;
  presentations_total_max: number | null;
  plan: string;
  plan_status: string;
  current_period_end?: string;
};

export default function AccountSubscription() {
  const [portalLoading, setPortalLoading] = useState(false);
  const [usage, setUsage] = useState<Usage | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const headers = await (await import("@/app/(presentation-generator)/services/api/header")).getHeader();
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/ppt/user/usage`, { headers });
        if (res.ok) {
          const data = await res.json();
          setUsage(data);
        }
      } catch {}
    };
    load();
  }, []);

  const openPortal = async () => {
    try {
      setPortalLoading(true);
      const url = await BillingApi.openPortal();
      window.location.href = url;
    } finally {
      setPortalLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      <div className="mb-2">
        <h1 className="text-xl font-semibold text-deep-navy">Subscription</h1>
        <p className="text-sm text-slate-500">Manage your plan, billing, and usage.</p>
      </div>

      {usage && usage.plan !== "free" && (usage.plan_status === "active" || usage.plan_status === "trialing") ? (
        <div className="mt-4 flex items-start justify-between gap-6">
          <div>
            <div className="text-sm text-slate-600">Current plan</div>
            <div className="text-lg font-semibold capitalize text-deep-navy">{usage.plan}</div>
            <div className="text-xs text-slate-500">Status: {usage.plan_status}</div>
            {usage.current_period_end && (
              <div className="text-xs text-slate-500">Renews: {new Date(usage.current_period_end).toLocaleDateString()}</div>
            )}
            <div className="mt-4 space-y-1 text-sm">
              <div className="text-slate-600">Slides: {usage.slides_used} / {usage.slides_monthly_max}</div>
              <div className="text-slate-600">Presentations: {usage.presentations_used} / {usage.presentations_total_max ?? "∞"}</div>
            </div>
          </div>
          <button
            onClick={openPortal}
            disabled={portalLoading}
            className="h-10 px-4 py-2 bg-deep-navy text-white rounded-lg flex items-center gap-2 hover:opacity-90 disabled:opacity-60"
          >
            {portalLoading && <Loader2 className="animate-spin" size={16} />} Manage billing
          </button>
        </div>
      ) : (
        <div className="mt-6 rounded-lg border border-slate-200 bg-gradient-to-b from-white to-slate-50/50 p-10 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-slate-200 bg-white">
            <Minus className="h-6 w-6 text-slate-400" />
          </div>
          <div className="text-lg font-semibold text-deep-navy">No Active Subscription</div>
          <p className="mx-auto mt-2 max-w-xl text-sm text-slate-600">
            Subscribe to one of our plans to access premium features and start creating amazing presentations.
          </p>
          <div className="mt-6">
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-[#066678] to-[#005264] px-5 py-2.5 text-sm font-semibold text-white hover:shadow-md"
            >
              View Pricing Plans
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
