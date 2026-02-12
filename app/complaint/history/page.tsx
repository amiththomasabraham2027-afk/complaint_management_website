"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { PageHeader } from "@/components/layout/page-header";
import { ComplaintCard } from "@/components/cards/complaint-card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Search, Plus, Loader } from "lucide-react";

interface Complaint {
  _id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  category: string;
  createdAt: string;
}

export default function ComplaintHistoryPage() {
  const router = useRouter();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    search: "",
  });

  useEffect(() => {
    const loadComplaints = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          router.push("/auth/login");
          return;
        }

        let queryParams = new URLSearchParams();
        queryParams.append("page", "1");
        queryParams.append("limit", "100");
        if (filters.status) queryParams.append("status", filters.status);
        if (filters.priority) queryParams.append("priority", filters.priority);
        if (filters.search) queryParams.append("search", filters.search);

        const response = await fetch(`/api/complaints?${queryParams}`, {
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
        setComplaints(data.data.complaints || []);
      } catch (error) {
        console.error("Error loading complaints:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadComplaints();
  }, [filters, router]);

  return (
    <div className="flex min-h-screen container-app">
      <Sidebar />
      <main className="flex-1 p-4 md:p-8">
        <PageHeader
          title="My Complaints"
          description="Track and manage your submitted complaints"
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

        {/* Filters */}
        <div className="glass-card p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search complaints..."
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
                className="pl-10"
              />
            </div>
            <Select
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value })
              }
            >
              <option value="">All Status</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Rejected">Rejected</option>
            </Select>
            <Select
              value={filters.priority}
              onChange={(e) =>
                setFilters({ ...filters, priority: e.target.value })
              }
            >
              <option value="">All Priority</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </Select>
          </div>
        </div>

        {/* Complaints Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="animate-spin mr-2" />
            Loading your complaints...
          </div>
        ) : complaints.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <p className="text-muted-foreground mb-4">
              You haven't submitted any complaints yet.
            </p>
            <Button
              variant="default"
              onClick={() => router.push("/complaint/new")}
            >
              Submit Your First Complaint
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {complaints.map((complaint, idx) => (
              <motion.div
                key={complaint._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <ComplaintCard
                  id={complaint._id}
                  title={complaint.title}
                  description={complaint.description}
                  status={complaint.status}
                  priority={complaint.priority}
                  category={complaint.category}
                  createdAt={complaint.createdAt}
                  onClick={() => router.push(`/complaint/${complaint._id}`)}
                />
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
