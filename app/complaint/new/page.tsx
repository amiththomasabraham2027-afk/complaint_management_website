"use client";

import React from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { PageHeader } from "@/components/layout/page-header";
import { ComplaintForm } from "@/components/forms/complaint-form";
import { Card, CardContent } from "@/components/ui/card";

export default function NewComplaintPage() {
  return (
    <div className="flex min-h-screen container-app">
      <Sidebar />
      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-2xl">
          <PageHeader
            title="Submit a New Complaint"
            description="Provide detailed information about your complaint"
          />
          <Card className="glass-effect">
            <CardContent className="pt-6">
              <ComplaintForm />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
