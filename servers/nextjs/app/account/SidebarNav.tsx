"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, CreditCard, LogOut, LayoutDashboard } from "lucide-react";
import { SignOutButton } from "@clerk/nextjs";

function itemClasses(active: boolean): string {
  const base = "flex items-center gap-2 px-3 py-2 rounded hover:bg-slate-50";
  return active ? `${base} bg-slate-100 font-semibold text-deep-navy` : base;
}

export default function SidebarNav() {
  const pathname = usePathname();
  const isOverview = pathname.startsWith("/account/overview");
  const isProfile = pathname.startsWith("/account/profile");
  const isSubscription = pathname.startsWith("/account/subscription");

  return (
    <nav className="bg-white rounded-lg shadow p-4 space-y-1">
      <Link
        href="/account/overview"
        className={itemClasses(isOverview)}
        aria-current={isOverview ? "page" : undefined}
      >
        <LayoutDashboard className="w-4 h-4" />
        <span>Overview</span>
      </Link>
      <Link
        href="/account/profile"
        className={itemClasses(isProfile)}
        aria-current={isProfile ? "page" : undefined}
      >
        <User className="w-4 h-4" />
        <span>Profile</span>
      </Link>
      <Link
        href="/account/subscription"
        className={itemClasses(isSubscription)}
        aria-current={isSubscription ? "page" : undefined}
      >
        <CreditCard className="w-4 h-4" />
        <span>Subscription</span>
      </Link>
      <SignOutButton signOutOptions={{ redirectUrl: "/" }}>
        <button className="w-full flex items-center gap-2 px-3 py-2 rounded hover:bg-red-50 text-red-600">
          <LogOut className="w-4 h-4 text-red-600" />
          <span>Logout</span>
        </button>
      </SignOutButton>
    </nav>
  );
}


