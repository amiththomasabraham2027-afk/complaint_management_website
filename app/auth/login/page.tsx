"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LoginSchema, type LoginFormData } from "@/lib/validation/schemas";
import { motion } from "framer-motion";
import { AlertCircle, Loader, LogIn } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setErrorMessage("");

    try {
      const validatedData = LoginSchema.parse(formData);
      setIsLoading(true);

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validatedData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Login failed");
      }

      const data = await response.json();
      localStorage.setItem("authToken", data.data.token);
      localStorage.setItem("user", JSON.stringify(data.data));

      // Redirect based on role
      const redirectUrl = data.data.role === "admin" ? "/dashboard/admin" : "/dashboard/user";
      router.push(redirectUrl);
    } catch (error: any) {
      if (error.errors) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err: any) => {
          newErrors[err.path[0]] = err.message;
        });
        setErrors(newErrors);
      } else {
        setErrorMessage(error.message || "Login failed");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LogIn size={24} />
            Welcome Back
          </CardTitle>
          <CardDescription>
            Sign in to your ResolveX account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {errorMessage && (
              <Alert type="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}

            <div className="form-group">
              <label htmlFor="email" className="label">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                disabled={isLoading}
              />
              {errors.email && <p className="input-error">{errors.email}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="password" className="label">
                Password
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                disabled={isLoading}
              />
              {errors.password && <p className="input-error">{errors.password}</p>}
            </div>

            <Button
              type="submit"
              variant="default"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <p className="text-sm text-muted-foreground text-center mt-6">
            Don't have an account?{" "}
            <Link href="/auth/register" className="text-primary hover:underline font-medium">
              Register here
            </Link>
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
