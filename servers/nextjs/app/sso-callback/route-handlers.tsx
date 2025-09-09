"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useClerk } from "@clerk/nextjs";

export default function SSOCallback() {
  const router = useRouter();
  const { handleRedirectCallback } = useClerk();

  useEffect(() => {
    const run = async () => {
      try {
        await handleRedirectCallback({
          redirectUrl: "/sso-callback",
        });
        router.replace("/dashboard");
      } catch (e) {
        router.replace("/");
      }
    };
    run();
  }, [handleRedirectCallback, router]);

  return null;
}


