"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface User {
  userId: string;
  email: string;
  name: string;
  role: "user" | "admin";
  token: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("authToken");
      const userStr = localStorage.getItem("user");

      if (!token || !userStr) {
        setIsLoading(false);
        return;
      }

      try {
        const userData = JSON.parse(userStr);
        setUser(userData);
      } catch (error) {
        console.error("Error parsing user data:", error);
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      setUser(null);
      router.push("/auth/login");
    }
  };

  const isAdmin = user?.role === "admin";

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    isAdmin,
    logout,
  };
}

export function useProtectedRoute(requireAdmin = false) {
  const { user, isLoading, isAuthenticated, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push("/auth/login");
      } else if (requireAdmin && !isAdmin) {
        router.push("/dashboard/user");
      }
    }
  }, [isLoading, isAuthenticated, isAdmin, requireAdmin, router]);

  return { user, isLoading, isAuthenticated, isAdmin };
}
