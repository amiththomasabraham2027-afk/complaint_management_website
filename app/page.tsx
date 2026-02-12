"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { BarChart3, ArrowRight, Shield, Zap, Eye } from "lucide-react";

export default function Home() {
  const router = useRouter();

  const features = [
    {
      icon: Shield,
      title: "Secure & Encrypted",
      description: "Enterprise-grade security with JWT authentication and bcrypt hashing",
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Server-side rendering with optimized MongoDB queries for instant load times",
    },
    {
      icon: Eye,
      title: "Full Transparency",
      description: "Real-time tracking and status updates for all complaints",
    },
  ];

  return (
    <div className="container-app min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="border-b border-border sticky top-0 z-50 backdrop-blur-xl bg-background/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
              <BarChart3 size={20} className="text-black" />
            </div>
            <span className="text-xl font-bold neon-text">ResolveX</span>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => router.push("/auth/login")}
            >
              Login
            </Button>
            <Button
              variant="default"
              onClick={() => router.push("/auth/register")}
            >
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-4xl mx-auto"
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-6 neon-text">
            Resolve Complaints Effortlessly
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8">
            A modern, secure platform for submitting, tracking, and managing complaints
            with real-time updates and a powerful admin dashboard.
          </p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="inline-block"
          >
            <Button
              size="lg"
              variant="default"
              onClick={() => router.push("/auth/register")}
              className="gap-2"
            >
              Start Now
              <ArrowRight size={20} />
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <h2 className="text-3xl font-bold neon-text text-center mb-12">Why Choose ResolveX?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="glass-card text-center"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center mx-auto mb-4">
                <feature.icon size={24} className="text-black" />
              </div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border mt-16 py-16 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
        <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
          Join thousands of users who are managing complaints efficiently with ResolveX
        </p>
        <Button
          size="lg"
          variant="default"
          onClick={() => router.push("/auth/register")}
        >
          Create Account Now
        </Button>
      </section>

      {/* Footer */}
      <footer className="border-t border-border mt-16 py-8 text-center text-muted-foreground">
        <p>&copy; 2026 ResolveX. All rights reserved.</p>
      </footer>
    </div>
  );
}
