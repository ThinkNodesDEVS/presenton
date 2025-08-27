"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Layout, Plus } from "lucide-react";

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`w-full sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "glass-nav border-b border-deep-navy/10"
          : "bg-pure-white border-b border-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo Section */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="text-component font-bold text-deep-navy transition-colors group-hover:text-electric-orange">
              Decky
            </div>
            <div className="hidden sm:block text-body-small text-medium-gray">
              The AI Agent That Creates Impressive Presentations
            </div>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-8">
            <Link
              href="/custom-layout"
              className="inline-flex items-center gap-2 text-deep-navy hover:text-electric-orange transition-colors duration-200"
            >
              <Plus className="w-5 h-5" />
              <span className="text-body font-medium font-inter">
                Create Template
              </span>
            </Link>
            <Link
              href="/template-preview"
              className="inline-flex items-center gap-2 text-deep-navy hover:text-electric-orange transition-colors duration-200"
            >
              <Layout className="w-5 h-5" />
              <span className="text-body font-medium font-inter">
                Templates
              </span>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
