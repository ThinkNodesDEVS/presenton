"use client";

import { useEffect, useRef, useState } from "react";
import { getHeader } from "@/app/(presentation-generator)/services/api/header";
import { BarChart3 } from "lucide-react";
import Link from "next/link";

type Usage = {
  slides_used: number;
  slides_monthly_max: number;
  presentations_used: number;
  presentations_total_max: number | null;
  plan: string;
};

export default function UsageDropdown({ showLabel = false, triggerClassName = "p-2 rounded-md text-white hover:bg-primary/80" }: { showLabel?: boolean; triggerClassName?: string }) {
  const [open, setOpen] = useState(false);
  const [usage, setUsage] = useState<Usage | null>(null);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const toggle = () => setOpen((v) => !v);

  useEffect(() => {
    const fetchUsage = async () => {
      try {
        setLoading(true);
        const headers = await getHeader();
        const base = (process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/$/, "")) || (typeof window !== "undefined" ? window.location.origin : "");
        const res = await fetch(`${base}/api/v1/ppt/user/usage`, { headers, cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setUsage(data);
        }
      } finally {
        setLoading(false);
      }
    };
    if (open && !usage) fetchUsage();
  }, [open, usage]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node | null;
      if (containerRef.current && target && !containerRef.current.contains(target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("touchstart", onClick);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("touchstart", onClick);
    };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const slideLeft = usage ? Math.max(0, usage.slides_monthly_max - usage.slides_used) : 0;
  const presLeft = usage && usage.presentations_total_max != null ? Math.max(0, usage.presentations_total_max - usage.presentations_used) : null;

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={toggle}
        className={triggerClassName}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          {showLabel && <span className="text-sm font-medium">Usage</span>}
        </span>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 rounded-lg border border-slate-200 bg-white shadow-lg z-50">
          <div className="p-4">
            <div className="text-sm text-slate-600 mb-1">Plan</div>
            <div className="text-deep-navy font-semibold">{usage ? usage.plan : "-"}</div>

            <div className="mt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Slides this month</span>
                <span className="text-deep-navy font-medium">{usage ? `${usage.slides_used}/${usage.slides_monthly_max}` : "-"}</span>
              </div>
              <div className="mt-2 h-2 w-full rounded-full bg-slate-100">
                <div className="h-2 rounded-full bg-[#066678]" style={{ width: usage ? `${Math.min(100, Math.round((usage.slides_used / Math.max(1, usage.slides_monthly_max)) * 100))}%` : "0%" }} />
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Presentations total</span>
                <span className="text-deep-navy font-medium">{usage ? `${usage.presentations_used}/${usage.presentations_total_max ?? "∞"}` : "-"}</span>
              </div>
              {usage?.presentations_total_max != null && (
                <div className="mt-2 h-2 w-full rounded-full bg-slate-100">
                  <div className="h-2 rounded-full bg-[#0B4858]" style={{ width: usage ? `${Math.min(100, Math.round((usage.presentations_used / Math.max(1, usage.presentations_total_max || 1)) * 100))}%` : "0%" }} />
                </div>
              )}
            </div>

            <div className="mt-4 text-xs text-slate-600">
              {loading ? "Loading..." : (
                <>
                  <div>Slides left: <span className="font-medium text-deep-navy">{slideLeft}</span></div>
                  {presLeft != null && <div>Presentations left: <span className="font-medium text-deep-navy">{presLeft}</span></div>}
                </>
              )}
            </div>

            <Link href="/pricing" className="mt-4 inline-flex w-full items-center justify-center rounded-md bg-gradient-to-r from-[#066678] to-[#005264] px-4 py-2 text-sm font-semibold text-white">Upgrade</Link>
          </div>
        </div>
      )}
    </div>
  );
}


