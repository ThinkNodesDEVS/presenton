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
  const [verificationCode, setVerificationCode] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const { signUp, setActive } = useSignUp();
  const { signIn, setActive: setActiveSignIn } = useSignIn();
  const router = useRouter();

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signUp?.attemptEmailAddressVerification({
        code: verificationCode,
      });

      if (result?.status === "complete") {
        await setActive({ session: result.createdSessionId });
        onClose();
        router.push("/upload");
      } else {
        setError("Invalid verification code. Please try again.");
      }
    } catch (err: any) {
      console.error("Verification error:", err);
      setError(err.errors?.[0]?.message || "Verification failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

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

        if (result?.status === "complete") {
          await setActiveSignIn({ session: result.createdSessionId });
          onClose();
          router.push("/upload");
        }
      } else {
        // Handle Sign Up
        const result = await signUp?.create({
          emailAddress: formData.email,
          password: formData.password,
        });

        // Prepare email verification
        if (result?.status === "missing_requirements" && result?.unverified_fields?.includes("email_address")) {
          await signUp?.prepareEmailAddressVerification({ strategy: "email_code" });
        }

        if (result?.status === "complete") {
          await setActive({ session: result.createdSessionId });
          onClose();
          router.push("/upload");
        } else if (result?.status === "missing_requirements") {
          // Check if email verification is required
          if (result?.unverified_fields?.includes("email_address")) {
            setPendingVerification(true);
            setError("Please enter the verification code sent to your email.");
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

  const handleResendEmail = async () => {
    try {
      await signUp?.prepareEmailAddressVerification({ strategy: "email_code" });
      setError("Verification email sent! Please check your inbox.");
    } catch (err: any) {
      console.error("Resend error:", err);
      setError("Failed to resend email. Please try again.");
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
            <form onSubmit={handleVerification} className="space-y-4">
              <div>
                <label
                  htmlFor="verificationCode"
                  className="block text-sm font-medium text-deep-navy mb-2"
                >
                  Verification Code
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-medium-gray"
                    size={18}
                  />
                  <input
                    type="text"
                    id="verificationCode"
                    name="verificationCode"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                    placeholder="Enter 6-digit code"
                    required
                    maxLength={6}
                  />
                </div>
              </div>

              {/* Verify Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-[#066678] to-[#005264] text-white py-3 rounded-lg font-semibold transition-all duration-200 hover:shadow-lg hover:scale-[1.02] hover:shadow-teal-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin" size={18} />
                    <span>Verifying...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <span>Verify Email</span>
                    <ArrowRight size={18} />
                  </div>
                )}
              </button>

              {/* Resend Email Button */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendEmail}
                  className="text-teal-600 hover:text-teal-700 font-medium transition-colors text-sm"
                >
                  Didn't receive the email? Resend
                </button>
              </div>
            </form>
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
