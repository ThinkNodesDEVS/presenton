"use client";

import { motion } from "framer-motion";

interface AnimatedHeadlineProps {
  mainText: string;
  accentText: string;
  subtitle: string;
}

export default function AnimatedHeadline({
  mainText,
  accentText,
  subtitle,
}: AnimatedHeadlineProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.7,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <h1 className="text-4xl md:text-5xl lg:text-[clamp(2.5rem,5vw,4rem)] font-bold text-[#1a1a1a] tracking-tight leading-[1.1] mb-4">
        {mainText}{" "}
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
          {accentText}
        </motion.span>
      </h1>
      <motion.p
        className="text-2xl md:text-3xl font-medium text-[#6b7280]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.3 }}
      >
        {subtitle}
      </motion.p>
    </motion.div>
  );
}
