"use client";

import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AnimatedButtonProps {
  text: string;
  onClick?: () => void;
}

export default function AnimatedButton({ text, onClick }: AnimatedButtonProps) {
  return (
    <motion.div
      whileHover={{ y: -5, boxShadow: "0 15px 30px rgba(15, 118, 110, 0.25)" }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
    >
      <Button
        onClick={onClick}
        className="group relative btn-enhanced bg-gradient-to-r from-[#0f766e] to-[#0d9488] text-white px-8 py-4 rounded-xl text-lg font-semibold"
        size="lg"
      >
        <span className="relative z-10 flex items-center">
          {text}
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
            transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
            style={{ width: "50%" }}
          />
        </span>
      </Button>
    </motion.div>
  );
}
