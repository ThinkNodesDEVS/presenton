import React from "react";
import Link from "next/link";
import { User, CreditCard, LogOut } from "lucide-react";
import { SignOutButton } from "@clerk/nextjs";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-900">Account</h1>
          <p className="text-slate-600">Manage your profile, credits and subscription.</p>
        </div>
        <div className="grid grid-cols-12 gap-6">
          <aside className="col-span-12 md:col-span-3">
            <nav className="bg-white rounded-lg shadow p-4 space-y-1">
              <Link href="/account/profile" className="flex items-center gap-2 px-3 py-2 rounded hover:bg-slate-50">
                <User className="w-4 h-4" />
                <span>Profile</span>
              </Link>
              <Link href="/account/subscription" className="flex items-center gap-2 px-3 py-2 rounded hover:bg-slate-50">
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
          </aside>
          <main className="col-span-12 md:col-span-9">{children}</main>
        </div>
      </div>
    </div>
  );
}
