"use client";

import React from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  getStatusColor,
  getStatusBgColor,
  getPriorityColor,
  getPriorityBgColor,
  formatDate,
} from "@/lib/utils/formatting";

interface ComplaintCardProps {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  category: string;
  createdAt: Date | string;
  onClick?: () => void;
}

export function ComplaintCard({
  id,
  title,
  description,
  status,
  priority,
  category,
  createdAt,
  onClick,
}: ComplaintCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      onClick={onClick}
      className="glass-card cursor-pointer group"
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
              {title}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">{category}</p>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
          {description}
        </p>

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="success" className={getStatusColor(status)}>
            {status}
          </Badge>
          <Badge variant="warning" className={getPriorityColor(priority as any)}>
            {priority}
          </Badge>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-border text-xs text-muted-foreground">
          <span>{formatDate(new Date(createdAt))}</span>
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              onClick?.();
            }}
          >
            View Details
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
