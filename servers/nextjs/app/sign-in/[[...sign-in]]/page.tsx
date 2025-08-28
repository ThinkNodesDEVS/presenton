"use client";

import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <SignIn signUpUrl="/sign-up" appearance={{ variables: { colorPrimary: "#5146E5" } }} />
    </div>
  );
}


