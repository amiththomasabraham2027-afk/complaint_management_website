"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { motion } from "framer-motion";
import { ArrowLeft, Loader, CheckCircle, AlertCircle } from "lucide-react";
import {
  getStatusColor,
  getPriorityColor,
  formatDate,
} from "@/lib/utils/formatting";

interface Complaint {
  _id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  category: string;
  userId: { name: string; email: string; _id: string };
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export default function ComplaintDetailPage() {
  const router = useRouter();
  const params = useParams();
  const complaintId = params.id as string;

  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const loadComplaint = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const userStr = localStorage.getItem("user");
        const user = userStr ? JSON.parse(userStr) : null;

        if (!token) {
          router.push("/auth/login");
          return;
        }

        setIsAdmin(user?.role === "admin");

        const response = await fetch(`/api/complaints/${complaintId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch complaint");
        }

        const data = await response.json();
        setComplaint(data.data);
        setNewStatus(data.data.status);
        setAdminNotes(data.data.adminNotes || "");
      } catch (error) {
        console.error("Error loading complaint:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadComplaint();
  }, [complaintId, router]);

  const handleStatusUpdate = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token || !isAdmin) return;

      setIsUpdating(true);
      const response = await fetch(`/api/complaints/${complaintId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error("Failed to update status");

      const data = await response.json();
      setComplaint(data.data);
      setSuccessMessage("Status updated successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error: any) {
      setErrorMessage(error.message);
      setTimeout(() => setErrorMessage(""), 3000);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAdminNotesUpdate = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token || !isAdmin) return;

      setIsUpdating(true);
      const response = await fetch(`/api/complaints/${complaintId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ adminNotes }),
      });

      if (!response.ok) throw new Error("Failed to update notes");

      const data = await response.json();
      setComplaint(data.data);
      setSuccessMessage("Admin notes updated successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error: any) {
      setErrorMessage(error.message);
      setTimeout(() => setErrorMessage(""), 3000);
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen container-app">
        <Sidebar isAdmin={isAdmin} />
        <main className="flex-1 p-4 md:p-8 flex items-center justify-center">
          <Loader className="animate-spin mr-2" />
          Loading complaint details...
        </main>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="flex min-h-screen container-app">
        <Sidebar isAdmin={isAdmin} />
        <main className="flex-1 p-4 md:p-8">
          <Alert type="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Complaint not found</AlertDescription>
          </Alert>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen container-app">
      <Sidebar isAdmin={isAdmin} />
      <main className="flex-1 p-4 md:p-8">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4 gap-2"
        >
          <ArrowLeft size={18} />
          Back
        </Button>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <PageHeader
            title={complaint.title}
            description={`Filed on ${formatDate(new Date(complaint.createdAt))}`}
          />

          {successMessage && (
            <Alert type="success" className="mb-6">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          )}

          {errorMessage && (
            <Alert type="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="glass-effect">
                <CardHeader>
                  <CardTitle>Complaint Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                      Description
                    </h3>
                    <p className="text-foreground">{complaint.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                        Category
                      </h3>
                      <p className="text-foreground">{complaint.category}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                        Priority
                      </h3>
                      <Badge
                        variant="warning"
                        className={getPriorityColor(complaint.priority as any)}
                      >
                        {complaint.priority}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                      Submitted By
                    </h3>
                    <p className="text-foreground">{complaint.userId.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {complaint.userId.email}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {complaint.adminNotes && (
                <Card className="glass-effect">
                  <CardHeader>
                    <CardTitle>Admin Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-foreground">{complaint.adminNotes}</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card className="glass-effect">
                <CardHeader>
                  <CardTitle>Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Badge
                      variant="success"
                      className={getStatusColor(complaint.status)}
                    >
                      {complaint.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Last updated {formatDate(new Date(complaint.updatedAt))}
                  </p>

                  {isAdmin && (
                    <div className="space-y-3 pt-4 border-t border-border">
                      <Select
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                        disabled={isUpdating}
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Rejected">Rejected</option>
                      </Select>
                      <Button
                        variant="default"
                        className="w-full"
                        onClick={handleStatusUpdate}
                        disabled={isUpdating || newStatus === complaint.status}
                      >
                        {isUpdating ? "Updating..." : "Update Status"}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {isAdmin && (
                <Card className="glass-effect">
                  <CardHeader>
                    <CardTitle className="text-lg">Admin Notes</CardTitle>
                    <CardDescription>
                      Internal notes visible only to admin
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Textarea
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        placeholder="Add your notes here..."
                        rows={4}
                        disabled={isUpdating}
                      />
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={handleAdminNotesUpdate}
                        disabled={isUpdating}
                      >
                        {isUpdating ? "Saving..." : "Save Notes"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
