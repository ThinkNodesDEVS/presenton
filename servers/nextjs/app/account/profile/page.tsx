"use client";
import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { User2, Pencil, Mail, IdCard, CheckCircle2, ShieldCheck } from "lucide-react";

export default function AccountProfile() {
  const { user, isLoaded } = useUser();
  const [fullName, setFullName] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [isEditing, setIsEditing] = useState<boolean>(false);

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
      setIsEditing(false);
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
      <div className="rounded-2xl shadow border border-slate-200 bg-gradient-to-br from-indigo-50 via-white to-indigo-50 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <User2 className="w-5 h-5 text-slate-700" />
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Profile</h2>
              <p className="text-slate-600 text-sm">Manage your personal information and avatar.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsEditing((v) => !v)}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-md border border-slate-300 hover:bg-white/70"
              title={isEditing ? "Stop editing" : "Edit"}
            >
              <Pencil className="w-4 h-4" />
              <span className="text-sm hidden sm:inline">{isEditing ? "Done" : "Edit"}</span>
            </button>
            <button
              onClick={onSave}
              disabled={isSaving || !isEditing}
              className="inline-flex items-center px-3 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-12 gap-6 items-center">
          <div className="col-span-12 sm:col-span-3">
            {user?.imageUrl ? (
              <div className="w-28 h-28 rounded-full overflow-hidden ring-2 ring-indigo-200">
                <img
                  src={user.imageUrl}
                  alt="avatar"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-slate-200 to-slate-100 flex items-center justify-center text-slate-700 text-2xl font-semibold select-none ring-2 ring-indigo-100">
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
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50"
              placeholder="Your full name"
            />
          </div>
        </div>
      </div>

      {/* Info Row */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 md:col-span-6">
          <div className="bg-white rounded-2xl shadow p-6 border border-slate-200">
            <label className="block text-sm text-slate-600 mb-2">Email Address</label>
            <div className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-900">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-slate-100">
                <Mail className="w-4 h-4 text-slate-700" />
              </span>
              <span className="truncate">{user?.primaryEmailAddress?.emailAddress}</span>
            </div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6">
          <div className="bg-white rounded-2xl shadow p-6 border border-slate-200">
            <label className="block text-sm text-slate-600 mb-2">User ID</label>
            <div className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-900 truncate">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-slate-100">
                <IdCard className="w-4 h-4 text-slate-700" />
              </span>
              <span className="truncate">{user?.id}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Status Row */}
      <div className="bg-white rounded-2xl shadow p-6 border border-slate-200">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">Account Status</h3>
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 md:col-span-6">
            <div className="border border-slate-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="text-xs text-slate-600">Account Status</div>
                <ShieldCheck className="w-4 h-4 text-green-600" />
              </div>
              <span className="mt-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <CheckCircle2 className="w-3 h-3" /> Active
              </span>
            </div>
          </div>
          <div className="col-span-12 md:col-span-6">
            <div className="border border-slate-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="text-xs text-slate-600">Email Status</div>
                <Mail className="w-4 h-4 text-blue-600" />
              </div>
              <span className="mt-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                <CheckCircle2 className="w-3 h-3" /> Verified
              </span>
            </div>
          </div>
        </div>
        {message && <p className="mt-3 text-sm text-slate-600">{message}</p>}
      </div>
    </div>
  );
}
