"use client";

import { useState, useEffect, useRef } from "react";
import {
  Menu,
  X,
  ArrowRight,
  Sparkles,
  CheckCircle,
  BarChart3,
  Clock,
  FileText,
  Monitor,
  Shield,
  Zap,
  Users,
  ChevronRight,
  Speaker,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import SignUpModal from "./SignUpModal";
import Aurora from "./Aurora";
import DeckyBento from "./DeckyBento";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const rotatingPhrases = [
  "Close deals",
  "Show expertise",
  "Win business",
  "Captivate any audience",
  "Stand out from the crowd",
];

// Animated mockup slide data
const mockupSlides = [
  {
    title: "Revenue Growth",
    icon: BarChart3,
    color: "from-[#066678] to-[#005264]",
  },
  {
    title: "Market Analysis",
    icon: Users,
    color: "from-purple-600 to-indigo-700",
  },
  {
    title: "Team Overview",
    icon: Zap,
    color: "from-amber-500 to-orange-600",
  },
];

// Trust signals data
const trustSignals = [
  { number: "98%", label: "User Satisfaction", icon: CheckCircle },
  { number: "3hrs", label: "Average Time Saved", icon: Clock },
];

export default function EnhancedLandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);

  const heroRef = useRef(null);
  const headlineRef = useRef(null);
  const subtitleRef = useRef(null);
  const ctaRef = useRef(null);
  const mockupRef = useRef(null);

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

  // Mockup slide rotation
  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % mockupSlides.length);
    }, 3000);

    return () => clearInterval(slideInterval);
  }, []);

  // Page load animation sequence
  useEffect(() => {
    if (!hasAnimated && heroRef.current) {
      // Begin animation sequence only once
      setHasAnimated(true);

      // This will trigger animations based on CSS classes with animation delays
      const elements = [
        headlineRef.current,
        subtitleRef.current,
        ctaRef.current,
        mockupRef.current,
      ];

      elements.forEach((el, index) => {
        if (el) {
          setTimeout(() => {
            (el as HTMLElement).classList.add("animate-appear");
          }, index * 200);
        }
      });
    }

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) {
      // Apply immediate appearance without animations
      document
        .querySelectorAll(".animate-on-scroll, .animate-appear")
        .forEach((el) => {
          (el as HTMLElement).classList.add("animated");
        });
    }
  }, [hasAnimated]);

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
              <Image src="/logo.png" alt="Decky Logo" width={55} height={55} />
            </div>

            {/* Enhanced Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <Button
                onClick={() => setIsSignUpOpen(true)}
                className="bg-gradient-to-r from-[#066678] to-[#005264] hover:from-[#005264] hover:to-[#066678] text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 hover:shadow-xl hover:scale-105 hover:shadow-teal-500/25"
                size="lg"
              >
                Get Started Free
              </Button>
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
              <Button
                onClick={() => {
                  setIsSignUpOpen(true);
                  setIsMenuOpen(false);
                }}
                className="w-full bg-gradient-to-r from-[#066678] to-[#005264] hover:from-[#005264] hover:to-[#066678] text-white rounded-xl font-semibold"
                size="lg"
              >
                Get Started Free
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* Enhanced Hero Section */}
      <section
        ref={heroRef}
        className="relative pt-28 pb-20 px-8 overflow-hidden min-h-screen flex items-center"
        style={{
          backgroundImage:
            "radial-gradient(ellipse at top, #f1f5f9 0%, #e2e8f0 50%, #cbd5e1 100%)",
        }}
      >
        {/* Floating geometric elements - appear on scroll */}
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <div
            className="absolute top-1/4 left-1/4 w-40 h-40 rounded-full bg-gradient-to-r from-blue-300/10 to-teal-200/10 blur-xl animate-float"
            style={{ animationDuration: "8s" }}
          ></div>
          <div
            className="absolute bottom-1/4 right-1/5 w-64 h-64 rounded-full bg-gradient-to-r from-orange-200/10 to-amber-100/10 blur-xl animate-float-delayed"
            style={{ animationDuration: "6s" }}
          ></div>
          <div
            className="absolute top-2/3 right-1/3 w-20 h-20 rounded-full bg-gradient-to-r from-purple-300/10 to-pink-200/10 blur-lg animate-float"
            style={{ animationDuration: "7s" }}
          ></div>
        </div>

        {/* Gradient Overlay - Subtle */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent pointer-events-none backdrop-blur-[2px]"></div>

        <div className="container mx-auto max-w-7xl relative z-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Column - Content */}
            <div className="text-center lg:text-left space-y-8">
              {/* Main Headline */}
              <motion.div
                ref={headlineRef}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.7,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <h1 className="text-4xl md:text-5xl lg:text-[clamp(2.5rem,5vw,4rem)] font-bold text-[#1a1a1a] tracking-tight leading-[1.1] mb-4">
                  Create Presentations that{" "}
                  <motion.span
                    className="bg-gradient-to-r from-[#FF6B35] to-[#f59e0b] bg-clip-text text-transparent inline-block"
                    animate={{
                      scale: [1, 1.02, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "reverse",
                      ease: "easeInOut",
                    }}
                  >
                    Stand Out
                  </motion.span>
                </h1>
                <motion.p
                  className="text-2xl md:text-3xl font-medium text-[#6b7280]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.7, delay: 0.3 }}
                >
                  Professional slides in minutes, not hours
                </motion.p>
              </motion.div>

              {/* Enhanced Subtitle */}
              <motion.div
                ref={subtitleRef}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.7,
                  delay: 0.2,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <p className="text-xl text-[#6b7280] mb-8 max-w-lg mx-auto lg:mx-0 leading-relaxed">
                  Your ideas deserve better than boring slides. Create
                  presentations that command attention with AI-powered design,
                  compelling narratives, and stunning visuals—ready in minutes.
                </p>
              </motion.div>

              {/* Trust Signals */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.7,
                  delay: 0.4,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="flex flex-col sm:flex-row gap-8 justify-center lg:justify-start mb-6"
              >
                {trustSignals.map((signal, index) => {
                  const Icon = signal.icon;
                  return (
                    <motion.div
                      key={index}
                      className="flex items-center"
                      whileHover={{
                        scale: 1.05,
                        transition: { duration: 0.2 },
                      }}
                    >
                      <motion.div
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.6 }}
                      >
                        <Icon size={18} className="text-[#FF6B35] mr-2" />
                      </motion.div>
                      <div>
                        <motion.span
                          className="font-bold text-gray-900"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3, delay: 0.1 * index }}
                        >
                          {signal.number}
                        </motion.span>
                        <motion.span
                          className="text-sm text-gray-600 ml-1"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{
                            duration: 0.3,
                            delay: 0.2 + 0.1 * index,
                          }}
                        >
                          {signal.label}
                        </motion.span>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>

              {/* Enhanced CTA Button */}
              <motion.div
                ref={ctaRef}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.7,
                  delay: 0.6,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="flex flex-col sm:flex-row gap-4 mb-12 justify-center lg:justify-start"
              >
                <motion.div
                  whileHover={{
                    y: -5,
                    boxShadow: "0 15px 30px rgba(15, 118, 110, 0.25)",
                  }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Button
                    onClick={() => setIsSignUpOpen(true)}
                    className="group relative btn-enhanced bg-gradient-to-r from-[#0f766e] to-[#0d9488] text-white px-8 py-4 rounded-xl text-lg font-semibold"
                    size="lg"
                  >
                    <span className="relative z-10 flex items-center">
                      Create Your First Deck
                      <motion.div
                        animate={{ x: [0, 4, 0] }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "easeInOut",
                          repeatDelay: 1,
                        }}
                      >
                        <ChevronRight className="ml-1" size={20} />
                      </motion.div>
                    </span>
                    <span className="absolute inset-0 overflow-hidden rounded-xl">
                      <motion.span
                        className="absolute left-0 top-0 h-full bg-gradient-to-r from-white/20 to-transparent transform skew-x-[20deg]"
                        animate={{ x: ["-100%", "200%"] }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          repeatDelay: 3,
                        }}
                        style={{ width: "50%" }}
                      />
                    </span>
                  </Button>
                </motion.div>

                {/* <button className="group px-10 py-4 rounded-2xl text-lg font-semibold border-2 border-gray-300 text-gray-700 hover:border-[#066678] hover:text-[#066678] transition-all duration-300">
                <span className="flex items-center justify-center gap-2">
                  <Play size={20} />
                  Watch Demo
                </span>
              </button> */}
              </motion.div>

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

            {/* Enhanced Right Column - Visual */}
            <div className="relative lg:block hidden">
              {/* Enhanced Presentation Preview Mockup */}
              <div
                ref={mockupRef}
                className="relative opacity-0 transform translate-x-8 transition-all duration-700 delay-400"
              >
                {/* Spotlight effect */}
                <div className="absolute -inset-4 bg-gradient-radial from-blue-100/20 to-transparent rounded-full blur-xl"></div>

                {/* 3D Tilt Container */}
                <div className="relative perspective-1000">
                  {/* Main Screen with 3D Transform */}
                  <div className="bg-white rounded-3xl shadow-[0_30px_60px_rgba(0,0,0,0.12)] p-8 transform hover:rotate-y-[-5deg] hover:rotate-x-[5deg] transition-transform duration-500 hover:shadow-2xl will-change-transform">
                    {/* Dynamic Slide Content */}
                    <div
                      className={`bg-gradient-to-br ${mockupSlides[currentSlideIndex].color} rounded-2xl h-56 flex items-center justify-center mb-6`}
                    >
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={currentSlideIndex}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.5 }}
                          className="text-white text-center w-full"
                        >
                          {(() => {
                            const SlideIcon =
                              mockupSlides[currentSlideIndex].icon;
                            return (
                              <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 0.8 }}
                                transition={{ duration: 0.5 }}
                              >
                                <SlideIcon size={48} className="mx-auto mb-4" />
                              </motion.div>
                            );
                          })()}
                          <motion.div
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.3, delay: 0.2 }}
                            className="text-lg font-semibold"
                          >
                            {mockupSlides[currentSlideIndex].title}
                          </motion.div>
                          <motion.div
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 0.8 }}
                            transition={{ duration: 0.3, delay: 0.3 }}
                            className="text-sm"
                          >
                            Professional Template
                          </motion.div>
                        </motion.div>
                      </AnimatePresence>
                    </div>

                    {/* Slide content preview */}
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-200 rounded-full w-3/4 animate-pulse"></div>
                      <div
                        className="h-4 bg-gray-200 rounded-full w-1/2 animate-pulse"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                      <div
                        className="h-4 bg-gray-200 rounded-full w-2/3 animate-pulse"
                        style={{ animationDelay: "0.4s" }}
                      ></div>
                    </div>

                    {/* Slide indicators */}
                    <div className="flex justify-center mt-4 space-x-2">
                      {mockupSlides.map((_, idx) => (
                        <div
                          key={idx}
                          className={`w-2 h-2 rounded-full transition-all duration-300 ${
                            idx === currentSlideIndex
                              ? "bg-gray-500 w-4"
                              : "bg-gray-300"
                          }`}
                        ></div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Enhanced Floating Elements */}
                <motion.div
                  className="absolute -top-6 -right-6 bg-white/90 backdrop-blur-md rounded-2xl shadow-lg p-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{
                    opacity: 1,
                    y: [0, -8, 0],
                  }}
                  transition={{
                    delay: 0.5,
                    duration: 3,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "easeInOut",
                  }}
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                  }}
                >
                  <div className="flex items-center gap-2">
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatType: "loop",
                        ease: "easeInOut",
                      }}
                    >
                      <Sparkles className="text-[#FF6B35]" size={20} />
                    </motion.div>
                    <span className="text-sm font-semibold">AI Generated</span>
                  </div>
                </motion.div>

                <motion.div
                  className="absolute -bottom-6 -left-6 bg-white/90 backdrop-blur-md rounded-2xl shadow-lg p-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{
                    opacity: 1,
                    y: [0, -10, 0],
                  }}
                  transition={{
                    delay: 0.7,
                    duration: 4,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "easeInOut",
                  }}
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                  }}
                >
                  <div className="flex items-center gap-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    >
                      <Clock className="text-[#FF6B35]" size={20} />
                    </motion.div>
                    <span className="text-sm font-semibold">
                      1 min creation
                    </span>
                  </div>
                </motion.div>

                <motion.div
                  className="absolute top-1/3 -right-12 bg-white/90 backdrop-blur-md rounded-2xl shadow-lg p-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{
                    opacity: 1,
                    y: [0, -6, 0],
                  }}
                  transition={{
                    delay: 0.9,
                    duration: 3.5,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "easeInOut",
                  }}
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                  }}
                >
                  <div className="flex items-center gap-2">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatType: "reverse",
                      }}
                    >
                      <Shield className="text-green-600" size={20} />
                    </motion.div>
                    <span className="text-sm font-semibold">
                      Enterprise Security
                    </span>
                  </div>
                </motion.div>

                <motion.div
                  className="absolute bottom-1/3 -left-12 bg-white/90 backdrop-blur-md rounded-2xl shadow-lg p-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{
                    opacity: 1,
                    y: [0, -8, 0],
                  }}
                  transition={{
                    delay: 1.1,
                    duration: 5,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "easeInOut",
                  }}
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                  }}
                >
                  <div className="flex items-center gap-2">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatType: "reverse",
                      }}
                    >
                      <Speaker className="text-[#FF6B35]" size={20} />
                    </motion.div>
                    <span className="text-sm font-semibold">
                      Captivate any audience
                    </span>
                  </div>
                </motion.div>

                <motion.div
                  className="absolute -top-6 -left-6 bg-white/90 backdrop-blur-md rounded-2xl shadow-lg p-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{
                    opacity: 1,
                    y: [0, -7, 0],
                  }}
                  transition={{
                    delay: 1.3,
                    duration: 4.5,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "easeInOut",
                  }}
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                  }}
                >
                  <div className="flex items-center gap-2">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatType: "reverse",
                      }}
                    >
                      <Check className="text-green-600" size={20} />
                    </motion.div>
                    <span className="text-sm font-semibold">Win business</span>
                  </div>
                </motion.div>

                <motion.div
                  className="absolute -bottom-6 -right-6 bg-white/90 backdrop-blur-md rounded-2xl shadow-lg p-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{
                    opacity: 1,
                    y: [0, -9, 0],
                  }}
                  transition={{
                    delay: 0.8,
                    duration: 3.8,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "easeInOut",
                  }}
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                  }}
                >
                  <div className="flex items-center gap-2">
                    <motion.div
                      animate={{
                        rotate: [0, 5, -5, 0],
                        scale: [1, 1.1, 1],
                      }}
                      transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        repeatType: "reverse",
                      }}
                    >
                      <Users className="text-blue-600" size={20} />
                    </motion.div>
                    <span className="text-sm font-semibold">Close deals</span>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Separator className="bg-gray-200" />

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

      <Separator className="bg-gray-200" />

      {/* Device Compatibility Section */}
      <section className="py-16 px-8 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              <span className="bg-gradient-to-r from-[#FF6B35] to-[#dd947a] bg-clip-text text-transparent">
                Start anywhere, finish everywhere
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12">
              Your work flows with you across every device. Create, edit, and
              present from anywhere.
            </p>
          </div>

          {/* Stats and testimonial */}
          <div className="mt-20 max-w-5xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-center">
              {/* Stats */}
              <div className="lg:col-span-3 grid grid-cols-3 gap-4 bg-gray-50 p-6 rounded-xl">
                {[
                  { metric: "99.9%", label: "Sync reliability" },
                  { metric: "<1s", label: "Cross-device sync time" },
                  { metric: "50M+", label: "Documents synced daily" },
                ].map((stat, i) => (
                  <div key={i} className="text-center">
                    <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#066678] to-[#005264] bg-clip-text text-transparent">
                      {stat.metric}
                    </div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Testimonial */}
              <div className="bg-gray-50 p-6 rounded-xl">
                <p className="text-gray-600 italic text-sm mb-4">
                  "I start my presentations on my laptop during my commute, make
                  final touches on my tablet, and present directly from my
                  phone. It's seamless."
                </p>
                <div className="font-medium text-gray-800">Sarah Chen</div>
                <div className="text-xs text-gray-500">Marketing Director</div>
              </div>
            </div>
          </div>

          {/* Supported platforms */}
          <div className="mt-16 text-center">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">
              Supported platforms
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Desktop</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  {["Windows 10+", "macOS 10.15+", "Linux Ubuntu 18+"].map(
                    (os, i) => (
                      <div key={i}>{os}</div>
                    )
                  )}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Tablet</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  {["iPad iOS 14+", "Android tablets 9+"].map((os, i) => (
                    <div key={i}>{os}</div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Mobile</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  {["iPhone iOS 14+", "Android 9+"].map((os, i) => (
                    <div key={i}>{os}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Separator className="bg-gray-200" />

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
          <div className="mb-8 flex justify-center">
            <div className="inline-flex items-center justify-center rounded-md border bg-white/10 text-white border-white/20 px-4 py-2 text-sm font-semibold">
              <Sparkles className="w-4 h-4 mr-2" />
              Ready to Get Started?
            </div>
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
            <Button
              onClick={() => setIsSignUpOpen(true)}
              className="group bg-gradient-to-r from-[#066678] to-[#005264] hover:from-[#005264] hover:to-[#066678] text-white px-12 py-4 rounded-2xl text-lg font-semibold transition-all duration-300 hover:shadow-2xl hover:scale-105 hover:shadow-teal-500/30"
              size="lg"
            >
              Start Creating Free
              <ArrowRight
                className="transition-transform group-hover:translate-x-1"
                size={20}
              />
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <div className="inline-flex items-center justify-center rounded-md border text-gray-300 border-gray-600 px-3 py-1 text-sm">
              <CheckCircle size={14} className="mr-2" />
              No credit card required
            </div>
            <div className="inline-flex items-center justify-center rounded-md border text-gray-300 border-gray-600 px-3 py-1 text-sm">
              <CheckCircle size={14} className="mr-2" />
              Free forever plan
            </div>
            <div className="inline-flex items-center justify-center rounded-md border text-gray-300 border-gray-600 px-3 py-1 text-sm">
              <CheckCircle size={14} className="mr-2" />
              Cancel anytime
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
                  width={60}
                  height={60}
                />
              </div>
              <p className="text-gray-400 max-w-md mb-6">
                The AI-powered presentation tool that transforms your ideas into
                stunning presentations in minutes.
              </p>
              <div className="flex space-x-4">
                {/* Social Links would go here */}
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-end items-center">
            <p className="text-gray-400 text-sm">
              © 2024 Decky. All rights reserved.
            </p>
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
