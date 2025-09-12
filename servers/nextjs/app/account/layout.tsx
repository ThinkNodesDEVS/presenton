import React from "react";
import Link from "next/link";
import { User, CreditCard, LogOut, LayoutDashboard } from "lucide-react";
import { SignOutButton } from "@clerk/nextjs";
import Header from "@/app/(presentation-generator)/dashboard/components/Header";
import SidebarNav from "./SidebarNav";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-900">Account</h1>
          <p className="text-slate-600">Manage your profile, credits, and subscription.</p>
        </div>
        <div className="grid grid-cols-12 gap-6">
          <aside className="col-span-12 md:col-span-3">
            <SidebarNav />
          </aside>
          <main className="col-span-12 md:col-span-9">{children}</main>
        </div>
      </div>
    </div>
  );
}
