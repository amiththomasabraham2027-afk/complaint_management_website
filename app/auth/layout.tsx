import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login - ResolveX",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container-app min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  );
}
