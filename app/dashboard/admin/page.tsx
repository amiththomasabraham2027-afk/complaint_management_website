"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { BarChart3, AlertCircle, Loader } from "lucide-react";
import { getStatusColor, formatDate } from "@/lib/utils/formatting";

interface Complaint {
  _id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  category: string;
  userName?: string;
  userEmail?: string;
  createdAt: string;
  adminNotes?: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    category: "",
    search: "",
  });
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
    rejected: 0,
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
        if (filters.category) queryParams.append("category", filters.category);
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
        const allComplaints = data.data.complaints || [];
        setComplaints(allComplaints);

        // Calculate stats
        setStats({
          total: allComplaints.length,
          pending: allComplaints.filter((c: any) => c.status === "Pending").length,
          inProgress: allComplaints.filter((c: any) => c.status === "In Progress").length,
          resolved: allComplaints.filter((c: any) => c.status === "Resolved").length,
          rejected: allComplaints.filter((c: any) => c.status === "Rejected").length,
        });
      } catch (error: any) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadComplaints();
  }, [filters, router]);

  const handleStatusUpdate = async (complaintId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      const response = await fetch(`/api/complaints/${complaintId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error("Failed to update status");

      setComplaints((prev) =>
        prev.map((c) =>
          c._id === complaintId ? { ...c, status: newStatus } : c
        )
      );
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Admin Dashboard"
        description="Manage all complaints and track resolution progress"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {[
          { label: "Total", value: stats.total, color: "text-foreground" },
          { label: "Pending", value: stats.pending, color: "text-yellow-400" },
          { label: "In Progress", value: stats.inProgress, color: "text-blue-400" },
          { label: "Resolved", value: stats.resolved, color: "text-green-400" },
          { label: "Rejected", value: stats.rejected, color: "text-red-500" },
        ].map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card text-center"
          >
            <p className="text-xs text-muted-foreground">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input
              placeholder="Search by title..."
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
            />
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
            <Select
              value={filters.category}
              onChange={(e) =>
                setFilters({ ...filters, category: e.target.value })
              }
            >
              <option value="">All Categories</option>
              <option value="Service Quality">Service Quality</option>
              <option value="Billing">Billing</option>
              <option value="Product">Product</option>
              <option value="Delivery">Delivery</option>
              <option value="Staff">Staff</option>
              <option value="Facility">Facility</option>
              <option value="Safety">Safety</option>
              <option value="Other">Other</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Complaints Table */}
      <Card className="glass-effect overflow-hidden">
        <CardHeader>
          <CardTitle>All Complaints</CardTitle>
          <CardDescription>
            {isLoading ? "Loading..." : `${complaints.length} complaints`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 flex items-center gap-2">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="animate-spin mr-2" />
              Loading complaints...
            </div>
          ) : complaints.length === 0 ? (
            <div className="text-center py-12">
              <BarChart3 size={48} className="mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No complaints found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold">Title</th>
                    <th className="text-left py-3 px-4 font-semibold">Category</th>
                    <th className="text-left py-3 px-4 font-semibold">Status</th>
                    <th className="text-left py-3 px-4 font-semibold">Priority</th>
                    <th className="text-left py-3 px-4 font-semibold">Date</th>
                    <th className="text-left py-3 px-4 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {complaints.map((complaint) => (
                    <motion.tr
                      key={complaint._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-b border-border/50 hover:bg-white/5 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-foreground truncate">
                            {complaint.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {complaint.description.substring(0, 50)}...
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-4">{complaint.category}</td>
                      <td className="py-4 px-4">
                        <Badge variant="success" className={getStatusColor(complaint.status)}>
                          {complaint.status}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">{complaint.priority}</td>
                      <td className="py-4 px-4 text-sm text-muted-foreground">
                        {formatDate(new Date(complaint.createdAt))}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              router.push(`/complaint/${complaint._id}`)
                            }
                          >
                            View
                          </Button>
                          <Select
                            value={complaint.status}
                            onChange={(e) =>
                              handleStatusUpdate(complaint._id, e.target.value)
                            }
                            className="w-24"
                          >
                            <option value="Pending">Pending</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Resolved">Resolved</option>
                            <option value="Rejected">Rejected</option>
                          </Select>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
