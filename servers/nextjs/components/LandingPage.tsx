"use client";

import { useState, useEffect } from "react";
import { Menu, X, ArrowRight, Sparkles, Zap, Shield, Play } from "lucide-react";
import SignUpModal from "./SignUpModal";
import Aurora from "./Aurora";

const rotatingPhrases = [
  "Close deals",
  "Show expertise",
  "Win business",
  "Captivate any audience",
  "Stand out from the crowd",
];

export default function LandingPage() {
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
    <div className="min-h-screen bg-pure-white font-inter">
      {/* Header */}
      <header
        className={`fixed top-0 w-full z-50 transition-all duration-500 ${
          isScrolled
            ? " backdrop-blur-xl border-b border-white/20 shadow-lg shadow-black/5"
            : "bg-transparent"
        }`}
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-[#066678] to-[#005264] bg-clip-text text-transparent animate-slideInLeft">
                Decky
              </h1>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <button
                onClick={() => setIsSignUpOpen(true)}
                className="bg-gradient-to-r from-[#066678] to-[#005264] text-white px-6 py-2.5 rounded-lg font-semibold transition-all duration-200 hover:shadow-lg hover:scale-105 hover:shadow-teal-500/25"
              >
                Get Started Free
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-xl border-t border-white/20">
            <div className="container mx-auto px-6 py-4">
              <button
                onClick={() => {
                  setIsSignUpOpen(true);
                  setIsMenuOpen(false);
                }}
                className="w-full bg-gradient-to-r from-[#066678] to-[#005264] text-white px-6 py-3 rounded-lg font-semibold"
              >
                Get Started Free
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        {/* Aurora Background */}
        <div className="absolute inset-0 w-full h-full opacity-60">
          <Aurora
            colorStops={["#00D4AA", "#066678", "#005264"]}
            amplitude={1.5}
            blend={0.8}
            speed={0.7}
          />
        </div>

        {/* Fallback CSS gradient in case WebGL doesn't work */}
        <div className="absolute inset-0 w-full h-full opacity-30 bg-gradient-to-br from-[#00D4AA]/40 via-[#066678]/30 to-[#005264]/40 animate-pulse"></div>

        {/* Subtle Gradient Overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/30 to-white/60 pointer-events-none"></div>

        <div className="container mx-auto max-w-4xl text-center relative z-20">
          {/* Main Headline with Rotating Text */}
          <div className="mb-8">
            <h1 className="text-4xl md:text-6xl font-bold text-deep-navy mb-6 leading-tight">
              Create Impressive Presentations that{" "}
              <span className="relative">
                <span
                  key={currentPhraseIndex}
                  className="bg-gradient-to-r from-[#066678] to-[#005264] bg-clip-text text-transparent animate-fadeIn"
                >
                  {rotatingPhrases[currentPhraseIndex]}
                </span>
              </span>
              <br />
              <span className="text-deep-navy">in minutes</span>
            </h1>

            <p className="text-xl text-medium-gray mb-12 max-w-2xl mx-auto leading-relaxed">
              Transform your ideas into impressive presentations with AI.
              Professional layouts, compelling content, and stunning visuals—all
              generated in minutes.
            </p>
          </div>

          {/* Primary CTA */}
          <div className="mb-16">
            <button
              onClick={() => setIsSignUpOpen(true)}
              className="group bg-gradient-to-r from-[#066678] to-[#005264] text-white px-12 py-4 rounded-xl text-lg font-semibold transition-all duration-300 hover:shadow-2xl hover:scale-105 hover:shadow-teal-500/30 relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                Start Creating Free
                <ArrowRight
                  className="transition-transform group-hover:translate-x-1"
                  size={20}
                />
              </span>
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 bg-gray-50/50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-deep-navy mb-4">
              Why Choose Decky?
            </h2>
            <p className="text-xl text-medium-gray max-w-2xl mx-auto">
              Everything you need to create presentations that leave a lasting
              impression
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 text-center group animate-slideInUp">
              <div className="w-16 h-16 bg-gradient-to-r from-[#066678] to-[#005264] rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                <Sparkles className="text-white" size={28} />
              </div>
              <h3 className="text-xl font-semibold text-deep-navy mb-4">
                AI-Powered Creation
              </h3>
              <p className="text-medium-gray leading-relaxed">
                Transform your ideas into polished presentations using advanced
                AI that understands design, content, and flow.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 text-center group animate-slideInUp animate-delay-100">
              <div className="w-16 h-16 bg-gradient-to-r from-[#066678] to-[#005264] rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                <Zap className="text-white" size={28} />
              </div>
              <h3 className="text-xl font-semibold text-deep-navy mb-4">
                Lightning Fast
              </h3>
              <p className="text-medium-gray leading-relaxed">
                Go from concept to complete presentation in minutes, not hours.
                Perfect for tight deadlines and busy schedules.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 text-center group animate-slideInUp animate-delay-200">
              <div className="w-16 h-16 bg-gradient-to-r from-[#066678] to-[#005264] rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                <Shield className="text-white" size={28} />
              </div>
              <h3 className="text-xl font-semibold text-deep-navy mb-4">
                Professional Quality
              </h3>
              <p className="text-medium-gray leading-relaxed">
                Every presentation follows design best practices with
                professional layouts, typography, and visual hierarchy.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-deep-navy mb-4">
              How It Works
            </h2>
            <p className="text-xl text-medium-gray max-w-2xl mx-auto">
              From idea to impressive presentation in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {/* Step 1 */}
            <div className="text-center animate-slideInUp">
              <div className="w-16 h-16 bg-gradient-to-r from-[#066678] to-[#005264] rounded-full flex items-center justify-center mb-6 mx-auto text-white text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold text-deep-navy mb-4">
                Share Your Idea
              </h3>
              <p className="text-medium-gray leading-relaxed">
                Tell Decky what you want to present. Upload documents, share key
                points, or just describe your vision.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center animate-slideInUp animate-delay-100">
              <div className="w-16 h-16 bg-gradient-to-r from-[#066678] to-[#005264] rounded-full flex items-center justify-center mb-6 mx-auto text-white text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold text-deep-navy mb-4">
                AI Creates Magic
              </h3>
              <p className="text-medium-gray leading-relaxed">
                Our AI analyzes your content and generates a complete
                presentation with professional design and compelling narrative.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center animate-slideInUp animate-delay-200">
              <div className="w-16 h-16 bg-gradient-to-r from-[#066678] to-[#005264] rounded-full flex items-center justify-center mb-6 mx-auto text-white text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold text-deep-navy mb-4">
                Present & Impress
              </h3>
              <p className="text-medium-gray leading-relaxed">
                Review, customize if needed, and present your stunning slides.
                Export to PowerPoint or present directly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative py-24 px-6 bg-deep-navy overflow-hidden">
        {/* Aurora Background */}
        <div className="absolute inset-0 w-full h-full opacity-40">
          <Aurora
            colorStops={["#00D4AA", "#066678", "#005264"]}
            amplitude={1.2}
            blend={0.9}
            speed={0.4}
          />
        </div>

        {/* Fallback CSS gradient in case WebGL doesn't work */}
        <div className="absolute inset-0 w-full h-full opacity-25 bg-gradient-to-br from-[#00D4AA]/30 via-[#066678]/20 to-[#005264]/30 animate-pulse"></div>

        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Create Better Presentations?
          </h2>
          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
            Join thousands of professionals who've transformed their
            presentation game with Decky.
          </p>

          <button
            onClick={() => setIsSignUpOpen(true)}
            className="group bg-gradient-to-r from-[#066678] to-[#005264] text-white px-12 py-4 rounded-xl text-lg font-semibold transition-all duration-300 hover:shadow-2xl hover:scale-105 hover:shadow-teal-500/30 relative overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              Start Creating Free
              <Play
                className="transition-transform group-hover:translate-x-1"
                size={20}
              />
            </span>
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-deep-navy border-t border-gray-800 py-12 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between">
            {/* Logo */}
            <div className="mb-6 md:mb-0">
              <h2 className="text-xl font-bold bg-gradient-to-r from-[#066678] to-[#005264] bg-clip-text text-transparent">
                Decky
              </h2>
            </div>

            {/* Center Links */}
            <div className="flex space-x-8 mb-6 md:mb-0">
              <a
                href="#"
                className="text-gray-300 hover:text-white transition-colors"
              >
                About
              </a>
              <a
                href="#"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Help
              </a>
              <a
                href="#"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Contact
              </a>
            </div>

            {/* Right Links */}
            <div className="flex space-x-6">
              <a
                href="#"
                className="text-gray-400 hover:text-gray-300 transition-colors text-sm"
              >
                Privacy
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-gray-300 transition-colors text-sm"
              >
                Terms
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
