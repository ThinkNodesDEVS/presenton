"use client";

import { useState } from "react";
import { X, Mail, Lock, User, ArrowRight, Loader2 } from "lucide-react";
import { useSignUp, useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

interface SignUpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SignUpModal({ isOpen, onClose }: SignUpModalProps) {
  const [isLogin, setIsLogin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const { signUp, setActive } = useSignUp();
  const { signIn, setActive: setActiveSignIn } = useSignIn();
  const router = useRouter();



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      if (isLogin) {
        // Handle Sign In
        const result = await signIn?.create({
          identifier: formData.email,
          password: formData.password,
        });

        if (result?.status === "complete" && setActiveSignIn) {
          await setActiveSignIn({ session: result.createdSessionId });
          onClose();
          router.push("/dashboard");
        }
      } else {
        // Handle Sign Up
        const nameParts = (formData.name || "").trim().split(/\s+/);
        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(" ") || "";
        const result = await signUp?.create({
          emailAddress: formData.email,
          password: formData.password,
          // firstName,
          // lastName,
        });

        // Handle email verification if required
        // Following: https://clerk.com/docs/custom-flows/email-password
        if (result?.status === "missing_requirements" && result?.unverifiedFields?.includes("email_address")) {
          // Prepare email verification with code (not magic link)
          await signUp?.prepareEmailAddressVerification({ strategy: "email_code" });
          setPendingVerification(true);
        }

        if (result?.status === "complete" && setActive) {
          await setActive({ session: result.createdSessionId });
          onClose();
          router.push("/dashboard");
        } else if (result?.status === "missing_requirements") {
          // Check if email verification is required
            if (result?.unverifiedFields?.includes("email_address")) {
            setPendingVerification(true);
              setError(""); // Clear error as we show the magic link UI instead
          } else {
            setError("Please check your email for verification instructions.");
          }
        }
      }
    } catch (err: any) {
      console.error("Authentication error:", err);
      setError(err.errors?.[0]?.message || "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Attempt email verification with the code
      // Following: https://clerk.com/docs/custom-flows/email-password
      const completeSignUp = await signUp?.attemptEmailAddressVerification({
        code: verificationCode,
      });

      // Check the status to see if it is complete
      // If complete, the user has been created -- set the session active
      if (completeSignUp?.status === "complete" && setActive) {
        await setActive({ 
          session: completeSignUp.createdSessionId,
          beforeEmit: () => {
            onClose();
            router.push("/dashboard");
          }
        });
      } else {
        setError("Verification failed. Please try again.");
      }
    } catch (err: any) {
      console.error("Verification error:", err);
      setError(err.errors?.[0]?.message || "Verification failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    try {
      await signUp?.prepareEmailAddressVerification({ strategy: "email_code" });
      setError("Verification code sent! Please check your inbox.");
    } catch (err: any) {
      console.error("Resend error:", err);
      setError("Failed to resend verification code. Please try again.");
    }
  };

  const handleGoogleAuth = async () => {
    try {
      setIsLoading(true);
      setError("");
      if (isLogin) {
        await signIn?.authenticateWithRedirect({
          strategy: "oauth_google",
          redirectUrl: "/sso-callback",
          redirectUrlComplete: "/dashboard",
        });
      } else {
        await signUp?.authenticateWithRedirect({
          strategy: "oauth_google",
          redirectUrl: "/sso-callback",
          redirectUrlComplete: "/dashboard",
        });
      }
    } catch (err: any) {
      console.error("Google auth error:", err);
      setError(err.errors?.[0]?.message || "Google authentication failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error when user starts typing
    if (error) setError("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X size={20} className="text-gray-500" />
        </button>

        {/* Modal Content */}
        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-[#066678] to-[#005264] bg-clip-text text-transparent mb-2">
              Decky
            </h2>
            <h3 className="text-xl font-semibold text-deep-navy mb-2">
              {isLogin ? "Welcome back!" : "Get started for free"}
            </h3>
            <p className="text-medium-gray">
              {isLogin
                ? "Sign in to continue creating amazing presentations"
                : "Create your account and start building impressive presentations"}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          {pendingVerification ? (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <div className="flex justify-center mb-3">
                  <Mail className="h-12 w-12 text-blue-500" />
                </div>
                <h3 className="text-lg font-medium text-deep-navy mb-2">Check your email</h3>
                <p className="text-medium-gray mb-2">
                  We've sent a verification code to <strong>{formData.email}</strong>
                </p>
                <p className="text-medium-gray text-sm">
                  Enter the 6-digit code below to verify your account
                </p>
              </div>

              {/* Verification Code Form */}
            <form onSubmit={handleVerification} className="space-y-4">
              <div>
                <label
                  htmlFor="verificationCode"
                  className="block text-sm font-medium text-deep-navy mb-2"
                >
                  Verification Code
                </label>
                  <input
                    type="text"
                    id="verificationCode"
                    name="verificationCode"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all text-center text-lg font-mono"
                    placeholder="000000"
                    maxLength={6}
                    required
                  />
              </div>

              <button
                type="submit"
                  disabled={isLoading || verificationCode.length !== 6}
                className="w-full bg-gradient-to-r from-[#066678] to-[#005264] text-white py-3 rounded-lg font-semibold transition-all duration-200 hover:shadow-lg hover:scale-[1.02] hover:shadow-teal-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin" size={18} />
                    <span>Verifying...</span>
                  </div>
                ) : (
                    "Verify Email"
                )}
              </button>
              </form>

              {/* Resend Code Button */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendCode}
                  className="text-teal-600 hover:text-teal-700 font-medium transition-colors text-sm"
                >
                  Didn't receive the code? Send again
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Field (only for sign up) */}
            {!isLogin && (
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-deep-navy mb-2"
                >
                  Full Name
                </label>
                <div className="relative">
                  <User
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-medium-gray"
                    size={18}
                  />
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                    placeholder="Enter your full name"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-deep-navy mb-2"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-medium-gray"
                  size={18}
                />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-deep-navy mb-2"
              >
                Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-medium-gray"
                  size={18}
                />
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  placeholder="Create a secure password"
                  required
                  minLength={6}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#066678] to-[#005264] text-white py-3 rounded-lg font-semibold transition-all duration-200 hover:shadow-lg hover:scale-[1.02] hover:shadow-teal-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="animate-spin" size={18} />
                  <span>
                    {isLogin ? "Signing in..." : "Creating account..."}
                  </span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <span>{isLogin ? "Sign In" : "Create Account"}</span>
                  <ArrowRight size={18} />
                </div>
              )}
            </button>

            {/* Or divider */}
            <div className="flex items-center my-4">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="px-3 text-sm text-medium-gray">or</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Google OAuth Button */}
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={isLoading}
              className="w-full border border-gray-300 text-deep-navy py-3 rounded-lg font-semibold transition-all duration-200 hover:shadow-sm hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="h-5 w-5">
                <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12 s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C33.1,6.053,28.805,4,24,4C12.955,4,4,12.955,4,24 s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
                <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.35,16.146,18.824,13,24,13c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657 C33.1,6.053,28.805,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
                <path fill="#4CAF50" d="M24,44c4.717,0,9.002-1.813,12.25-4.771l-5.657-5.657C28.595,35.798,26.393,36.5,24,36.5 c-5.202,0-9.616-3.317-11.278-7.946l-6.535,5.036C9.505,39.556,16.227,44,24,44z"/>
                <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.053,5.572 c0.001-0.001,0.002-0.001,0.003-0.002l5.657,5.657C35.759,39.127,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
              </svg>
              <span>{isLogin ? "Sign in with Google" : "Sign up with Google"}</span>
            </button>
          </form>
          )}

          {/* Toggle between Login/Signup */}
          <div className="mt-6 text-center">
            <p className="text-medium-gray">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setFormData({ name: "", email: "", password: "" });
                  setError("");
                  setPendingVerification(false);
                  setVerificationCode("");
                }}
                className="ml-1 text-teal-600 hover:text-teal-700 font-medium transition-colors"
              >
                {isLogin ? "Sign up" : "Sign in"}
              </button>
            </p>
          </div>

          {/* Terms */}
          {!isLogin && (
            <div className="mt-4 text-center">
              <p className="text-xs text-medium-gray">
                By creating an account, you agree to our{" "}
                <a
                  href="#"
                  className="text-teal-600 hover:text-teal-700 transition-colors"
                >
                  Terms of Service
                </a>{" "}
                and{" "}
                <a
                  href="#"
                  className="text-teal-600 hover:text-teal-700 transition-colors"
                >
                  Privacy Policy
                </a>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
