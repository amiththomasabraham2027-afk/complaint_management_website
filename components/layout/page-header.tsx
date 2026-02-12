"use client";

import React from "react";
import { motion } from "framer-motion";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col md:flex-row md:items-center md:justify-between mb-8"
    >
      <div className="flex-1 mb-4 md:mb-0">
        <h1 className="text-4xl font-bold neon-text mb-2">{title}</h1>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </motion.div>
  );
}
