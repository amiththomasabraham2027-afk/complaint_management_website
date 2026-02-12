import type { Metadata, Viewport } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "ResolveX - Complaint Management System",
  description: "A modern, secure complaint management platform with real-time tracking and admin dashboard.",
  charset: "utf-8",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" style={{ fontFamily: "'Geist', system-ui, sans-serif" }}>
      <body className="bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
