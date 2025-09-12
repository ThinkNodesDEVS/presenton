"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Loader2, RefreshCw } from "lucide-react";

type Usage = {
  slides_used: number;
  slides_monthly_max: number;
  presentations_used: number;
  presentations_total_max: number | null;
  plan: string;
  plan_status: string;
  current_period_end?: string;
};

export default function AccountOverview() {
  const [usage, setUsage] = useState<Usage | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<Array<{ created_at: string; name: string; description?: string; amount: number; category: string }>>([]);

  const fetchUsage = async () => {
    try {
      setLoading(true);
      setError(null);
      const headers = await (await import("@/app/(presentation-generator)/services/api/header")).getHeader();
      const base = (process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/$/, "")) || (typeof window !== "undefined" ? window.location.origin : "");
      // Best-effort bootstrap; ignore if backend is not running
      try {
        const boot = await fetch(`${base}/api/v1/ppt/user/bootstrap`, { method: "POST", headers });
        if (!boot.ok) {
          // If backend is missing (404/502/etc), we just skip showing its raw body
        }
      } catch (_) {}

      const res = await fetch(`${base}/api/v1/ppt/user/usage`, { headers, cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setUsage(data);
        const ev = await fetch(`${base}/api/v1/ppt/user/usage/events`, { headers, cache: "no-store" });
        if (ev.ok) {
          const rows = await ev.json();
          setEvents(rows);
        }
      } else {
        const contentType = res.headers.get("content-type") || "";
        if (res.status === 404 || contentType.includes("text/html")) {
          setError("Backend API is unavailable (404). Start the API server to see usage.");
        } else {
          setError(`Failed to load usage (${res.status})`);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsage();
  }, []);

  const slidePct = useMemo(() => {
    if (!usage) return 0;
    if (usage.slides_monthly_max === 0) return 0;
    return Math.min(100, Math.round((usage.slides_used / usage.slides_monthly_max) * 100));
  }, [usage]);

  const presPct = useMemo(() => {
    if (!usage) return 0;
    const max = usage.presentations_total_max ?? Infinity;
    if (!isFinite(max)) return 0;
    if (max === 0) return 0;
    return Math.min(100, Math.round((usage.presentations_used / max) * 100));
  }, [usage]);

  return (
    <div className="space-y-6">
      {/* Credits/Usage Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-deep-navy">Credits</h2>
            <p className="text-sm text-slate-600">Check your balance and recent usage.</p>
          </div>
          <button
            onClick={fetchUsage}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-deep-navy hover:bg-slate-50 disabled:opacity-60"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />} Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {error && (
            <div className="col-span-1 md:col-span-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}
          {/* Balance */}
          <div className="rounded-lg border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-4">
            <div className="text-sm text-slate-500">Current balance</div>
            <div className="mt-1 text-4xl font-bold text-deep-navy">{usage ? Math.max(0, usage.slides_monthly_max - usage.slides_used) : 0}</div>
            <div className="text-xs text-slate-500">Slides available</div>
          </div>

          {/* Upgrade Prompt */}
          <div className="rounded-lg border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-4">
            <div className="text-sm font-medium text-deep-navy">Need more credits?</div>
            <div className="mt-1 text-xs text-slate-600">Upgrade to a higher plan for more credits</div>
            <Link
              href="/pricing"
              className="mt-3 inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-[#066678] to-[#005264] px-4 py-2 text-sm font-semibold text-white"
            >
              Upgrade Plan
            </Link>
            <div className="mt-2 text-[11px] text-slate-500">Get more credits, immediately.</div>
          </div>
        </div>

        {/* Usage Bars + Ledger */}
        <div className="mt-6 overflow-hidden rounded-lg border border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            <div className="p-4 text-sm text-slate-600 border-b md:border-b-0 md:border-r border-slate-200">
              <div className="mb-3">Slides this month</div>
              <div className="h-2 w-full rounded-full bg-slate-100">
                <div className="h-2 rounded-full bg-[#066678]" style={{ width: `${slidePct}%` }} />
              </div>
              <div className="mt-1 text-xs text-slate-500">{usage ? `${usage.slides_used} / ${usage.slides_monthly_max}` : "-"}</div>

              <div className="mt-5 mb-3">Presentations total</div>
              <div className="h-2 w-full rounded-full bg-slate-100">
                <div className="h-2 rounded-full bg-[#0B4858]" style={{ width: `${presPct}%` }} />
              </div>
              <div className="mt-1 text-xs text-slate-500">{usage ? `${usage.presentations_used} / ${usage.presentations_total_max ?? "∞"}` : "-"}</div>
            </div>

            <div className="min-h-[140px]">
              <div className="grid grid-cols-4 bg-slate-50/60 px-4 py-3 text-xs font-medium text-slate-600">
                <div>Date</div>
                <div>Name</div>
                <div>Description</div>
                <div className="text-right">Amount</div>
              </div>
              <div className="p-4 text-sm text-slate-600">
                {events.length === 0 ? (
                  <div className="text-xs text-slate-500">No recent usage entries.</div>
                ) : (
                  events.map((e, idx) => (
                    <div key={idx} className="grid grid-cols-4 py-2 border-b last:border-b-0 border-slate-100">
                      <div className="text-xs text-slate-500">{new Date(e.created_at).toLocaleDateString()}</div>
                      <div className="truncate">{e.name}</div>
                      <div className="truncate text-slate-500">{e.description || "—"}</div>
                      <div className="text-right font-medium">{e.category === 'slides' || e.category === 'presentations' ? `+${e.amount}` : e.amount}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-deep-navy">Subscription</h2>
        <p className="text-sm text-slate-600">You {usage && usage.plan !== "free" ? "have" : "don't have"} an active subscription.</p>
        <div className="mt-4">
          <Link
            href="/pricing"
            className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-deep-navy hover:bg-slate-50"
          >
            View pricing
          </Link>
        </div>
      </div>
    </div>
  );
}


