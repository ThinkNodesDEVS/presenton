"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import { getHeader } from "../(presentation-generator)/services/api/header";

export default function SSOCallback() {
  const router = useRouter();
  const { handleRedirectCallback } = useClerk();

  useEffect(() => {
    const run = async () => {
      try {
        await handleRedirectCallback({
          redirectUrl: "/sso-callback",
        });
        try {
          const headers = await getHeader();
          await fetch("/api/v1/ppt/user/bootstrap", { method: "POST", headers });
        } catch (_) {}
        router.replace("/dashboard");
      } catch (e) {
        router.replace("/");
      }
    };
    run();
  }, [handleRedirectCallback, router]);

  return null;
}


