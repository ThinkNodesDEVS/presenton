"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  ChevronRight,
  CheckCircle,
  BarChart3,
  Clock,
  Shield,
  Zap,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";

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

export default function AnimatedHero() {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // Mockup slide rotation
  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % mockupSlides.length);
    }, 3000);

    return () => clearInterval(slideInterval);
  }, []);

  return (
    <section
      className="relative pt-28 pb-20 px-8 overflow-hidden min-h-screen flex items-center"
      style={{
        backgroundImage:
          "radial-gradient(ellipse at top, #f1f5f9 0%, #e2e8f0 50%, #cbd5e1 100%)",
      }}
    >
      <div className="container mx-auto max-w-7xl relative z-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Column - Content */}
          <div className="text-center lg:text-left space-y-8">
            {/* Main Headline */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <h1 className="text-4xl md:text-5xl lg:text-[clamp(2.5rem,5vw,4rem)] font-bold text-[#1a1a1a] tracking-tight leading-[1.1] mb-4">
                Create Presentations that{" "}
                <motion.span
                  className="bg-gradient-to-r from-[#FF6B35] to-[#f59e0b] bg-clip-text text-transparent inline-block"
                  animate={{ scale: [1, 1.02, 1] }}
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
                      <span className="font-bold text-gray-900">
                        {signal.number}
                      </span>
                      <span className="text-sm text-gray-600 ml-1">
                        {signal.label}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* CTA Button */}
            <motion.div
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
            </motion.div>
          </div>

          {/* Right Column - Visual */}
          <div className="relative lg:block hidden">
            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.7,
                delay: 0.8,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
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

                  {/* Slide indicators */}
                  <div className="flex justify-center mt-4 space-x-2">
                    {mockupSlides.map((_, idx) => (
                      <motion.div
                        key={idx}
                        animate={{
                          width: idx === currentSlideIndex ? 16 : 8,
                          backgroundColor:
                            idx === currentSlideIndex ? "#6b7280" : "#d1d5db",
                        }}
                        className="h-2 rounded-full"
                        transition={{ duration: 0.3 }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <motion.div
                className="absolute -top-6 -right-6 bg-white/90 backdrop-blur-md rounded-2xl shadow-lg p-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                whileHover={{ scale: 1.05 }}
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
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.5 }}
                whileHover={{ scale: 1.05 }}
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
                  <span className="text-sm font-semibold">1 min creation</span>
                </div>
              </motion.div>

              <motion.div
                className="absolute top-1/3 -right-12 bg-white/90 backdrop-blur-md rounded-2xl shadow-lg p-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.5 }}
                whileHover={{ scale: 1.05 }}
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
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
