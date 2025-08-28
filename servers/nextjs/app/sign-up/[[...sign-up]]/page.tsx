"use client";

import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <SignUp signInUrl="/sign-in" appearance={{ variables: { colorPrimary: "#5146E5" } }} />
    </div>
  );
}


