"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { FileText, Plus, TrendingUp } from "lucide-react";

interface DashboardStats {
  totalComplaints: number;
  pendingComplaints: number;
  resolvedComplaints: number;
  userName: string;
}

export default function UserDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const user = localStorage.getItem("user");

        // Redirect to login if not authenticated
        if (!token || !user) {
          router.push("/auth/login");
          return;
        }

        const response = await fetch("/api/complaints?page=1&limit=100", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.status === 401) {
          localStorage.removeItem("authToken");
          localStorage.removeItem("user");
          router.push("/auth/login");
          return;
        }

        if (!response.ok) {
          console.error(`API error: ${response.status} ${response.statusText}`);
          throw new Error(`Failed to fetch complaints: ${response.statusText}`);
        }

        const data = await response.json();
        if (data.success && data.data) {
          const complaints = data.data.complaints || [];
          const parsedUser = JSON.parse(user);

          setStats({
            totalComplaints: complaints.length,
            pendingComplaints: complaints.filter(
              (c: any) => c.status === "Pending"
            ).length,
            resolvedComplaints: complaints.filter(
              (c: any) => c.status === "Resolved"
            ).length,
            userName: parsedUser.name || "User",
          });
        }
      } catch (error) {
        console.error("Dashboard load error:", error);
        setStats({
          totalComplaints: 0,
          pendingComplaints: 0,
          resolvedComplaints: 0,
          userName: "User",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, [router]);

  const StatCard = ({
    title,
    value,
    icon: Icon,
  }: {
    title: string;
    value: number;
    icon: React.ReactNode;
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <p className="text-3xl font-bold neon-text">{value}</p>
        </div>
        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center border border-primary/30">
          {Icon}
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Welcome, ${stats?.userName || "User"}!`}
        description="Manage your complaints and track their status"
        action={
          <Button
            variant="default"
            onClick={() => router.push("/complaint/new")}
            className="gap-2"
          >
            <Plus size={18} />
            New Complaint
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="glass-card h-24 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Total Complaints"
            value={stats?.totalComplaints || 0}
            icon={<FileText className="text-primary" />}
          />
          <StatCard
            title="Pending"
            value={stats?.pendingComplaints || 0}
            icon={<TrendingUp className="text-yellow-400" />}
          />
          <StatCard
            title="Resolved"
            value={stats?.resolvedComplaints || 0}
            icon={<TrendingUp className="text-green-400" />}
          />
        </div>
      )}

      <Card className="glass-effect">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Manage your complaints efficiently
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              variant="outline"
              className="h-12 text-left justify-start"
              onClick={() => router.push("/complaint/new")}
            >
              <Plus className="mr-2 h-4 w-4" />
              Submit New Complaint
            </Button>
            <Button
              variant="outline"
              className="h-12 text-left justify-start"
              onClick={() => router.push("/complaint/history")}
            >
              <FileText className="mr-2 h-4 w-4" />
              View My Complaints
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
