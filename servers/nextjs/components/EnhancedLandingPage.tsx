"use client";

import { useState, useEffect } from "react";
import {
  Menu,
  X,
  ArrowRight,
  Sparkles,
  Zap,
  Shield,
  Play,
  CheckCircle,
  Users,
  BarChart3,
  Clock,
  FileText,
  Monitor,
  Smartphone,
  Tablet,
  Star,
} from "lucide-react";
import SignUpModal from "./SignUpModal";
import Aurora from "./Aurora";
import DeckyBento from "./DeckyBento";
import Image from "next/image";

const rotatingPhrases = [
  "Close deals",
  "Show expertise",
  "Win business",
  "Captivate any audience",
  "Stand out from the crowd",
];

const stats = [
  { number: "50K+", label: "Presentations Created" },
  { number: "98%", label: "User Satisfaction" },
  { number: "10min", label: "Average Creation Time" },
];

// Features data moved to DeckyBento component

const steps = [
  {
    number: "01",
    title: "Share Your Idea",
    description:
      "Tell Decky what you want to present. Upload documents, share key points, or just describe your vision.",
    icon: FileText,
    delay: "0ms",
  },
  {
    number: "02",
    title: "AI Creates Magic",
    description:
      "Our AI analyzes your content and generates a complete presentation with professional design and compelling narrative.",
    icon: Sparkles,
    delay: "200ms",
  },
  {
    number: "03",
    title: "Present & Impress",
    description:
      "Review, customize if needed, and present your stunning slides. Export to PowerPoint or present directly.",
    icon: Monitor,
    delay: "400ms",
  },
];

export default function EnhancedLandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

  // Rotating text animation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPhraseIndex((prev) => (prev + 1) % rotatingPhrases.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Header scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white font-inter antialiased">
      {/* Enhanced Header */}
      <header
        className={`fixed top-0 w-full z-50 transition-all duration-500 ${
          isScrolled
            ? " backdrop-blur-xl border-b border-gray-100 shadow-lg shadow-black/5"
            : "bg-transparent"
        }`}
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Enhanced Logo */}
            <div className="flex items-center space-x-2">
              <Image src="/logo.png" alt="Decky Logo" width={50} height={50} />

              <h1 className="text-2xl font-bold bg-gradient-to-r from-[#066678] to-[#005264] bg-clip-text text-transparent">
                Decky
              </h1>
            </div>

            {/* Enhanced Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              {/* <nav className="flex items-center space-x-8">
                <a
                  href="#features"
                  className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
                >
                  Features
                </a>
              </nav> */}
              <button
                onClick={() => setIsSignUpOpen(true)}
                className="bg-gradient-to-r from-[#066678] to-[#005264] text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 hover:shadow-xl hover:scale-105 hover:shadow-teal-500/25 relative overflow-hidden group"
              >
                <span className="relative z-10">Get Started Free</span>
                <div className="absolute inset-0 bg-gradient-to-r from-[#005264] to-[#066678] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Toggle mobile menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Enhanced Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-xl border-t border-gray-100 shadow-lg">
            <div className="container mx-auto px-6 py-6 space-y-4">
              {/* <nav className="space-y-4">
                <a
                  href="#features"
                  className="block text-gray-600 hover:text-gray-900 transition-colors font-medium"
                >
                  Features
                </a>
              </nav> */}
              <button
                onClick={() => {
                  setIsSignUpOpen(true);
                  setIsMenuOpen(false);
                }}
                className="w-full bg-gradient-to-r from-[#066678] to-[#005264] text-white px-6 py-3 rounded-xl font-semibold"
              >
                Get Started Free
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Enhanced Hero Section */}
      <section className="relative pt-24 pb-20 px-6 overflow-hidden min-h-screen flex items-center">
        {/* Aurora Background */}
        <div className="absolute inset-0 w-full h-full opacity-40">
          <Aurora
            colorStops={["#00D4AA", "#066678", "#005264"]}
            amplitude={1.2}
            blend={0.7}
            speed={0.6}
          />
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/70 via-white/50 to-white/70 pointer-events-none"></div>

        <div className="container mx-auto max-w-7xl relative z-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Content */}
            <div className="text-center lg:text-left">
              {/* Main Headline */}
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Create Presentations that{" "}
                <span className="relative inline-block">
                  <span
                    key={currentPhraseIndex}
                    className="bg-gradient-to-r from-[#FF6B35] to-[#dd947a] bg-clip-text text-transparent animate-fadeIn"
                  >
                    {rotatingPhrases[currentPhraseIndex]}
                  </span>
                </span>
                <br />
                <span className="text-gray-600 text-3xl md:text-5xl lg:text-6xl">
                  in minutes
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-xl text-gray-600 mb-8 max-w-lg mx-auto lg:mx-0 leading-relaxed">
                Transform your ideas into stunning presentations with AI.
                Professional layouts, compelling content, and beautiful
                visuals—all generated instantly.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-12 justify-center lg:justify-start">
                <button
                  onClick={() => setIsSignUpOpen(true)}
                  className="group bg-gradient-to-r from-[#066678] to-[#005264] text-white px-10 py-4 rounded-2xl text-lg font-semibold transition-all duration-300 hover:shadow-2xl hover:scale-105 hover:shadow-teal-500/30 relative overflow-hidden"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    Start Creating Free
                    <ArrowRight
                      className="transition-transform group-hover:translate-x-1"
                      size={20}
                    />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                </button>

                {/* <button className="group px-10 py-4 rounded-2xl text-lg font-semibold border-2 border-gray-300 text-gray-700 hover:border-[#066678] hover:text-[#066678] transition-all duration-300">
                  <span className="flex items-center justify-center gap-2">
                    <Play size={20} />
                    Watch Demo
                  </span>
                </button> */}
              </div>

              {/* Stats */}
              {/* <div className="flex flex-col sm:flex-row gap-8 justify-center lg:justify-start">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center lg:text-left">
                    <div className="text-2xl font-bold text-gray-900">
                      {stat.number}
                    </div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </div>
                ))}
              </div> */}
            </div>

            {/* Right Column - Visual */}
            <div className="relative lg:block hidden">
              {/* Presentation Preview Mockup */}
              <div className="relative">
                {/* Main Screen */}
                <div className="bg-white rounded-3xl shadow-2xl p-8 transform rotate-3 hover:rotate-1 transition-transform duration-500">
                  <div className="bg-gradient-to-br from-[#066678] to-[#005264] rounded-2xl h-48 flex items-center justify-center mb-6">
                    <div className="text-white text-center">
                      <BarChart3
                        size={48}
                        className="mx-auto mb-4 opacity-80"
                      />
                      <div className="text-lg font-semibold">Sales Report</div>
                      <div className="text-sm opacity-80">
                        Professional Template
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded-full w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded-full w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded-full w-2/3"></div>
                  </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute -top-6 -right-6 bg-white rounded-2xl shadow-lg p-4 animate-float">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="text-[#FF6B35]" size={20} />
                    <span className="text-sm font-medium">AI Generated</span>
                  </div>
                </div>

                <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-lg p-4 animate-float-delayed">
                  <div className="flex items-center gap-2">
                    <Clock className="text-[#FF6B35]" size={20} />
                    <span className="text-sm font-medium">1 min creation</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section
        id="features"
        className="py-24 px-6 bg-gradient-to-b from-gray-50 to-white"
      >
        <div className="container mx-auto max-w-7xl">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Everything you need to create
              <br />
              <span className="bg-gradient-to-r from-[#FF6B35] to-[#dd947a] bg-clip-text text-transparent">
                impressive presentations
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Powerful AI-driven features that transform your ideas into
              stunning presentations in minutes, not hours.
            </p>
          </div>

          {/* Bento Grid */}
          <DeckyBento
            enableStars={true}
            enableSpotlight={true}
            enableBorderGlow={true}
            enableTilt={true}
            enableMagnetism={false}
            clickEffect={true}
            glowColor="6, 102, 120"
            spotlightRadius={300}
            particleCount={6}
          />
        </div>
      </section>

      {/* Enhanced How It Works Section */}

      {/* Device Compatibility Section */}
      <section className="py-24 px-6 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Works seamlessly across
              <br />
              <span className="bg-gradient-to-r from-[#FF6B35] to-[#dd947a] bg-clip-text text-transparent">
                all your devices
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Create, edit, and present from anywhere. Decky works perfectly on
              desktop, tablet, and mobile devices.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                icon: Monitor,
                title: "Desktop",
                desc: "Full-featured editing",
              },
              {
                icon: Tablet,
                title: "Tablet",
                desc: "Touch-optimized interface",
              },
              { icon: Smartphone, title: "Mobile", desc: "Present on the go" },
            ].map((device, index) => {
              const Icon = device.icon;
              return (
                <div key={index} className="text-center group">
                  <div className="size-16 md:size-20 bg-gradient-to-r from-[#066678] to-[#005264] rounded-3xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                    <Icon className="text-white" size={32} />
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">
                    {device.title}
                  </h3>
                  <p className="text-gray-600 text-sm md:text-base">
                    {device.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Enhanced Final CTA Section */}
      <section className="relative py-24 px-6 bg-gray-900 overflow-hidden">
        {/* Aurora Background */}
        <div className="absolute inset-0 w-full h-full opacity-30">
          <Aurora
            colorStops={["#00D4AA", "#066678", "#005264"]}
            amplitude={1.0}
            blend={0.8}
            speed={0.4}
          />
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 to-gray-900/60 pointer-events-none"></div>

        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <div className="inline-flex items-center px-4 py-2 bg-white/10 rounded-full border border-white/20 mb-8">
            <Sparkles className="w-4 h-4 text-white mr-2" />
            <span className="text-sm font-semibold text-white">
              Ready to Get Started?
            </span>
          </div>

          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Create your first presentation
            <br />
            <span className=" bg-gradient-to-r from-[#FF6B35] to-[#dd947a] bg-clip-text text-transparent">
              in under a minute
            </span>
          </h2>

          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
            Join thousands of professionals who've transformed their
            presentation game with Decky. Start creating today—no credit card
            required.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button
              onClick={() => setIsSignUpOpen(true)}
              className="group bg-gradient-to-r from-[#066678] to-[#005264] text-white px-12 py-4 rounded-2xl text-lg font-semibold transition-all duration-300 hover:shadow-2xl hover:scale-105 hover:shadow-teal-500/30 relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                Start Creating Free
                <ArrowRight
                  className="transition-transform group-hover:translate-x-1"
                  size={20}
                />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-col sm:flex-row gap-8 justify-center items-center text-gray-400">
            <div className="flex items-center gap-2">
              <CheckCircle size={16} />
              <span className="text-sm">No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle size={16} />
              <span className="text-sm">Free forever plan</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle size={16} />
              <span className="text-sm">Cancel anytime</span>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 py-16 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Logo & Description */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <Image
                  src="/logo.png"
                  alt="Decky Logo"
                  width={50}
                  height={50}
                />

                <h2 className="text-xl font-bold bg-gradient-to-r from-[#066678] to-[#005264] bg-clip-text text-transparent">
                  Decky
                </h2>
              </div>
              <p className="text-gray-400 max-w-md mb-6">
                The AI-powered presentation tool that transforms your ideas into
                stunning presentations in minutes.
              </p>
              <div className="flex space-x-4">
                {/* Social Links would go here */}
              </div>
            </div>

            {/* Product Links */}
            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Templates
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Pricing
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Enterprise
                  </a>
                </li>
              </ul>
            </div>

            {/* Support Links */}
            <div>
              <h3 className="text-white font-semibold mb-4">Support</h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Help Center
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Contact
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Privacy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Terms
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 Decky. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                Status
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                Changelog
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                API
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Sign Up Modal */}
      <SignUpModal
        isOpen={isSignUpOpen}
        onClose={() => setIsSignUpOpen(false)}
      />
    </div>
  );
}
