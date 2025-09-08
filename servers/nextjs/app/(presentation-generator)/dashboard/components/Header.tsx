"use client";

import Wrapper from "@/components/Wrapper";
import React, { useState } from "react";
import Link from "next/link";
import BackBtn from "@/components/BackBtn";
import { usePathname } from "next/navigation";
import HeaderNav from "@/app/(presentation-generator)/components/HeaderNab";
import { Layout, FilePlus2, Menu, X, LayoutDashboard, Settings, User } from "lucide-react";
import { trackEvent, MixpanelEvent } from "@/utils/mixpanel";
import logo from "@/images/logo.png";
import Image from "next/image";
import { RootState } from "@/store/store";
import { useSelector } from "react-redux";
import { useUser } from "@clerk/nextjs";

const Header = () => {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const canChangeKeys = useSelector((state: RootState) => state.userConfig.can_change_keys);
  const { isSignedIn } = useUser();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleNavClick = (to: string) => {
    trackEvent(MixpanelEvent.Navigation, {
      from: pathname,
      to,
    });
    closeMobileMenu();
  };

  return (
    <div className="bg-deep-navy w-full shadow-lg sticky top-0 z-50">
      <Wrapper>
        <div className="flex items-center justify-between py-1">
          <div className="flex items-center gap-3">
            {pathname !== "/upload" && pathname !== "/dashboard" && <BackBtn />}
            <Link
              href="/dashboard"
              onClick={() =>
                trackEvent(MixpanelEvent.Navigation, {
                  from: pathname,
                  to: "/dashboard",
                })
              }
            >
              <Image src={logo} alt="Decky Logo" width={55} height={55} />
            </Link>
          </div>
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/custom-template"
              prefetch={false}
              onClick={() =>
                trackEvent(MixpanelEvent.Navigation, {
                  from: pathname,
                  to: "/custom-template",
                })
              }
              className="flex items-center gap-2 px-3 py-2 text-white hover:bg-primary/80 rounded-md transition-colors outline-none"
              role="menuitem"
            >
              <FilePlus2 className="w-5 h-5" />
              <span className="text-sm font-medium font-inter">
                Create Template
              </span>
            </Link>
            <Link
              href="/template-preview"
              prefetch={false}
              onClick={() =>
                trackEvent(MixpanelEvent.Navigation, {
                  from: pathname,
                  to: "/template-preview",
                })
              }
              className="flex items-center gap-2 px-3 py-2 text-white hover:bg-primary/80 rounded-md transition-colors outline-none"
              role="menuitem"
            >
              <Layout className="w-5 h-5" />
              <span className="text-sm font-medium font-inter">Templates</span>
            </Link>
            <HeaderNav />
          </div>

          {/* Mobile Hamburger Menu */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 text-white hover:bg-primary/80 rounded-md transition-colors outline-none"
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </Wrapper>

      {/* Mobile Sidebar Drawer */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={closeMobileMenu}
          />
          
          {/* Sidebar */}
          <div className="fixed top-0 left-0 h-full w-80 bg-deep-navy shadow-xl z-50 md:hidden transform transition-transform duration-300 ease-in-out">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-700">
                <div className="flex items-center gap-3">
                  <Link
                    href="/dashboard"
                    onClick={() => handleNavClick("/dashboard")}
                  >
                    <Image src={logo} alt="Decky Logo" width={40} height={40} />
                  </Link>
                </div>
                <button
                  onClick={closeMobileMenu}
                  className="p-2 text-white hover:bg-primary/80 rounded-md transition-colors outline-none"
                  aria-label="Close mobile menu"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="flex-1 px-4 py-6">
                <div className="space-y-2">
                  <Link
                    href="/dashboard"
                    prefetch={false}
                    onClick={() => handleNavClick("/dashboard")}
                    className="flex items-center gap-3 px-3 py-3 text-white hover:bg-primary/80 rounded-md transition-colors outline-none w-full"
                    role="menuitem"
                  >
                    <LayoutDashboard className="w-5 h-5" />
                    <span className="text-sm font-medium font-inter">
                      Dashboard
                    </span>
                  </Link>
                  
                  <Link
                    href="/custom-template"
                    prefetch={false}
                    onClick={() => handleNavClick("/custom-template")}
                    className="flex items-center gap-3 px-3 py-3 text-white hover:bg-primary/80 rounded-md transition-colors outline-none w-full"
                    role="menuitem"
                  >
                    <FilePlus2 className="w-5 h-5" />
                    <span className="text-sm font-medium font-inter">
                      Create Template
                    </span>
                  </Link>
                  
                  <Link
                    href="/template-preview"
                    prefetch={false}
                    onClick={() => handleNavClick("/template-preview")}
                    className="flex items-center gap-3 px-3 py-3 text-white hover:bg-primary/80 rounded-md transition-colors outline-none w-full"
                    role="menuitem"
                  >
                    <Layout className="w-5 h-5" />
                    <span className="text-sm font-medium font-inter">Templates</span>
                  </Link>

                  {/* Account/Settings Link */}
                  {isSignedIn ? (
                    <Link
                      href="/account"
                      prefetch={false}
                      onClick={() => handleNavClick("/account")}
                      className="flex items-center gap-3 px-3 py-3 text-white hover:bg-primary/80 rounded-md transition-colors outline-none w-full"
                      role="menuitem"
                    >
                      <User className="w-5 h-5" />
                      <span className="text-sm font-medium font-inter">Account</span>
                    </Link>
                  ) : (
                    canChangeKeys && (
                      <Link
                        href="/settings"
                        prefetch={false}
                        onClick={() => handleNavClick("/settings")}
                        className="flex items-center gap-3 px-3 py-3 text-white hover:bg-primary/80 rounded-md transition-colors outline-none w-full"
                        role="menuitem"
                      >
                        <Settings className="w-5 h-5" />
                        <span className="text-sm font-medium font-inter">Settings</span>
                      </Link>
                    )
                  )}
                </div>
              </nav>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Header;
