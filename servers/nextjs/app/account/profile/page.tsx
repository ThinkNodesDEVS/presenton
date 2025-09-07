"use client";
import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";

export default function AccountProfile() {
  const { user, isLoaded } = useUser();
  const [fullName, setFullName] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    if (user) {
      const name = [user.firstName, user.lastName].filter(Boolean).join(" ");
      setFullName(name);
    }
  }, [user]);

  const onSave = async () => {
    if (!user) return;
    setIsSaving(true);
    setMessage("");
    try {
      const parts = (fullName || "").trim().split(/\s+/);
      const firstName = parts[0] || "";
      const lastName = parts.slice(1).join(" ") || "";
      await user.update({ firstName, lastName });
      setMessage("Saved");
    } catch (err: any) {
      setMessage(err?.errors?.[0]?.message || "Failed to save");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isLoaded) {
    return <div className="bg-white rounded-lg shadow p-6">Loading...</div>;
  }

  const initials = (() => {
    const name = (fullName || [user?.firstName, user?.lastName].filter(Boolean).join(" ")).trim();
    if (!name) return "?";
    return name
      .split(/\s+/)
      .filter(Boolean)
      .map((n) => n[0]?.toUpperCase())
      .slice(0, 2)
      .join("");
  })();

  return (
    <div className="space-y-6">
      {/* Profile Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Profile</h2>
            <p className="text-slate-600 text-sm">Manage your personal information and avatar.</p>
          </div>
          <button
            onClick={onSave}
            disabled={isSaving}
            className="inline-flex items-center px-3 py-2 rounded border border-slate-300 hover:bg-slate-50 disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
        </div>

        <div className="mt-6 grid grid-cols-12 gap-6 items-center">
          <div className="col-span-12 sm:col-span-3">
            {user?.imageUrl ? (
              <div className="w-28 h-28 rounded-full overflow-hidden">
                <img
                  src={user.imageUrl}
                  alt="avatar"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-28 h-28 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 text-2xl font-semibold select-none">
                {initials}
              </div>
            )}
          </div>
          <div className="col-span-12 sm:col-span-9">
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Your full name"
            />
          </div>
        </div>
      </div>

      {/* Info Row */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 md:col-span-6">
          <div className="bg-white rounded-lg shadow p-6">
            <label className="block text-sm text-slate-600 mb-1">Email Address</label>
            <div className="px-3 py-2 border border-slate-200 rounded bg-slate-50 text-slate-900">
              {user?.primaryEmailAddress?.emailAddress}
            </div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6">
          <div className="bg-white rounded-lg shadow p-6">
            <label className="block text-sm text-slate-600 mb-1">User ID</label>
            <div className="px-3 py-2 border border-slate-200 rounded bg-slate-50 text-slate-900 truncate">
              {user?.id}
            </div>
          </div>
        </div>
      </div>

      {/* Status Row */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">Account Status</h3>
        <div className="grid grid-cols-8 gap-4">
          <div className="col-span-8 md:col-span-4">
            <div className="border border-slate-200 rounded p-4">
              <div className="text-xs text-slate-600 mb-2">Account Status</div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Active</span>
            </div>
          </div>
          <div className="col-span-12 md:col-span-4">
            <div className="border border-slate-200 rounded p-4">
              <div className="text-xs text-slate-600 mb-2">Email Status</div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Verified</span>
            </div>
          </div>
        </div>
        {message && <p className="mt-3 text-sm text-slate-600">{message}</p>}
      </div>
    </div>
  );
}
