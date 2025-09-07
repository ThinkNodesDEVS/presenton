"use client";
import React from "react";
import { UserProfile } from "@clerk/nextjs";

export default function AccountProfile() {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h1 className="text-xl font-semibold mb-4">Profile</h1>
      <UserProfile routing="hash" />
    </div>
  );
}
