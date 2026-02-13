import type { Metadata, Viewport } from "next";
import "@/styles/globals.css";
import ClickSpark from "@/components/effects/click-spark";

export const metadata: Metadata = {
  title: "ResolveX - Complaint Management System",
  description: "A modern, secure complaint management platform with real-time tracking and admin dashboard.",
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
        <ClickSpark
          sparkColor="#a0ff00"
          sparkSize={12}
          sparkRadius={20}
          sparkCount={8}
          duration={400}
          easing="ease-out"
          extraScale={1.2}
        >
          {children}
        </ClickSpark>
      </body>
    </html>
  );
}
