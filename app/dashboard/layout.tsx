import type { Metadata } from "next";
import { Sidebar } from "@/components/layout/sidebar";

export const metadata: Metadata = {
  title: "Dashboard - ResolveX",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen container-app">
      <Sidebar />
      <main className="flex-1 p-4 md:p-8 ml-0 md:ml-0">
        {children}
      </main>
    </div>
  );
}
