"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  Menu,
  X,
  LogOut,
  Home,
  FileText,
  Settings,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface SidebarProps {
  isAdmin?: boolean;
  userEmail?: string;
}

export function Sidebar({ isAdmin = false, userEmail }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/auth/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const userMenuItems = [
    { label: "Dashboard", href: "/dashboard/user", icon: Home },
    { label: "New Complaint", href: "/complaint/new", icon: FileText },
    { label: "My Complaints", href: "/complaint/history", icon: BarChart3 },
  ];

  const adminMenuItems = [
    { label: "Dashboard", href: "/dashboard/admin", icon: Home },
    { label: "All Complaints", href: "/dashboard/admin?tab=complaints", icon: FileText },
    { label: "Users", href: "/dashboard/admin?tab=users", icon: Users },
    { label: "Settings", href: "/dashboard/admin?tab=settings", icon: Settings },
  ];

  const menuItems = isAdmin ? adminMenuItems : userMenuItems;

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-40 md:hidden glass-button"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/50 md:hidden z-30"
          />
        )}
      </AnimatePresence>

      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-black/80 to-black/40 backdrop-blur-xl border-r border-white/10 p-6 flex flex-col z-30 transition-transform duration-300 md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 mb-8 mt-12 md:mt-0">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
            <BarChart3 size={24} className="text-black" />
          </div>
          <span className="text-xl font-bold neon-text">ResolveX</span>
        </Link>

        {/* Navigation */}
        <nav className="flex-1 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 hover:border-primary/50 border border-transparent transition-all duration-300 group"
            >
              <item.icon size={18} className="group-hover:text-primary transition-colors" />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* User Info & Logout */}
        <div className="border-t border-border pt-4 space-y-3">
          {userEmail && (
            <div className="px-4 py-3 rounded-lg bg-white/5 border border-border">
              <p className="text-xs text-muted-foreground mb-1">Logged in as</p>
              <p className="text-sm font-medium text-foreground truncate">{userEmail}</p>
            </div>
          )}
          <Button
            onClick={handleLogout}
            variant="destructive"
            className="w-full justify-start gap-2"
          >
            <LogOut size={18} />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content Spacer */}
      <div className="hidden md:block w-64" />
    </>
  );
}
