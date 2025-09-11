"use client";

import React from "react";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";

export default function UpgradeModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-sm md:max-w-md rounded-2xl bg-white shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 hover:bg-gray-100 transition-colors"
          aria-label="Close"
        >
          <X size={18} className="text-gray-500" />
        </button>

        <div className="p-6 md:p-8">
          <div className="mb-3 text-center">
            <h2 className="text-xl md:text-2xl font-semibold text-deep-navy">You’ve reached your slide limit</h2>
            <p className="mt-2 text-sm text-medium-gray">
              Upgrade your plan to unlock more monthly slides and keep creating presentations.
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3">
            <button
              onClick={() => {
                onClose();
                router.push("/pricing");
              }}
              className="w-full rounded-lg bg-gradient-to-r from-[#066678] to-[#005264] px-4 py-2.5 font-semibold text-white hover:shadow-lg"
            >
              View Pricing & Upgrade
            </button>
            <button
              onClick={onClose}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-deep-navy hover:bg-gray-50"
            >
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


