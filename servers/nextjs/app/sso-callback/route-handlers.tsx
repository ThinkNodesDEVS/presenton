"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useClerk, useUser } from "@clerk/nextjs";

export default function SSOCallback() {
  const router = useRouter();
  const { handleRedirectCallback, signOut } = useClerk();
  const { user } = useUser();

  useEffect(() => {
    const run = async () => {
      try {
        await handleRedirectCallback({
          redirectUrl: "/sso-callback",
        });
        // After callback, user context should be available
        const email = user?.primaryEmailAddress?.emailAddress || "";
        if (email) {
          try {
            const res = await fetch("/api/blocked-email-domains");
            const data = await res.json();
            const domains: string[] = Array.isArray(data?.domains) ? data.domains : [];
            const domain = email.slice(email.lastIndexOf("@") + 1).toLowerCase();
            if (domains.includes(domain)) {
              await signOut();
              router.replace("/?error=work_email_required");
              return;
            }
          } catch {}
        }
        router.replace("/dashboard");
      } catch (e) {
        router.replace("/");
      }
    };
    run();
  }, [handleRedirectCallback, router, user, signOut]);

  return null;
}


