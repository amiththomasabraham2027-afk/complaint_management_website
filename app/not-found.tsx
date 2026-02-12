"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Home, AlertTriangle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="container-app min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        <div className="mb-6 flex justify-center">
          <AlertTriangle size={64} className="text-accent" />
        </div>

        <h1 className="text-5xl font-bold mb-2">404</h1>
        <h2 className="text-2xl font-bold neon-text mb-4">Page Not Found</h2>
        <p className="text-muted-foreground mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <Link href="/">
          <Button variant="default" className="gap-2" size="lg">
            <Home size={18} />
            Back to Home
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}
