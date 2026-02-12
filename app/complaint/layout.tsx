import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Complaint Management - ResolveX",
};

export default function ComplaintLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
