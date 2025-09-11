"use client";

import { useEffect, useState } from "react";
import { BillingApi } from "@/app/(presentation-generator)/services/api/billing";
import { Loader2 } from "lucide-react";

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
    <div className="bg-white rounded-lg shadow p-6">
      <h1 className="text-xl font-semibold mb-4">Subscription</h1>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-slate-600">Current plan</div>
          <div className="text-lg font-semibold capitalize">{usage?.plan || "free"}</div>
          <div className="text-xs text-slate-500">Status: {usage?.plan_status || "none"}</div>
          {usage?.current_period_end && (
            <div className="text-xs text-slate-500">Renews: {new Date(usage.current_period_end).toLocaleDateString()}</div>
          )}
        </div>
        <button onClick={openPortal} disabled={portalLoading} className="px-4 py-2 bg-deep-navy text-white rounded-lg flex items-center gap-2">
          {portalLoading && <Loader2 className="animate-spin" size={16} />} Manage billing
        </button>
      </div>

      <div className="mt-6">
        <div className="text-sm text-slate-600 mb-2">Usage</div>
        <div className="text-sm">Slides: {usage ? `${usage.slides_used} / ${usage.slides_monthly_max}` : "-"}</div>
        <div className="text-sm">Presentations: {usage ? `${usage.presentations_used} / ${usage.presentations_total_max ?? '∞'}` : "-"}</div>
      </div>
    </div>
  );
}
