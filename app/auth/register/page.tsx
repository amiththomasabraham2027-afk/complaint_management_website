"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RegisterSchema, type RegisterFormData } from "@/lib/validation/schemas";
import { motion } from "framer-motion";
import { AlertCircle, Loader, UserPlus, CheckCircle } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<RegisterFormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

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
    setSuccessMessage("");

    try {
      const validatedData = RegisterSchema.parse(formData);
      setIsLoading(true);

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: validatedData.name,
          email: validatedData.email,
          password: validatedData.password,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Registration failed");
      }

      const data = await response.json();
      setSuccessMessage("Account created successfully! Redirecting...");
      localStorage.setItem("authToken", data.data.token);
      localStorage.setItem("user", JSON.stringify(data.data));

      setTimeout(() => {
        router.push("/dashboard/user");
      }, 2000);
    } catch (error: any) {
      if (error.errors) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err: any) => {
          newErrors[err.path[0]] = err.message;
        });
        setErrors(newErrors);
      } else {
        setErrorMessage(error.message || "Registration failed");
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
            <UserPlus size={24} />
            Create Account
          </CardTitle>
          <CardDescription>
            Join ResolveX to start managing complaints
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {successMessage && (
              <Alert type="success">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>{successMessage}</AlertDescription>
              </Alert>
            )}

            {errorMessage && (
              <Alert type="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}

            <div className="form-group">
              <label htmlFor="name" className="label">
                Full Name
              </label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                disabled={isLoading}
              />
              {errors.name && <p className="input-error">{errors.name}</p>}
            </div>

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

            <div className="form-group">
              <label htmlFor="confirmPassword" className="label">
                Confirm Password
              </label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                disabled={isLoading}
              />
              {errors.confirmPassword && (
                <p className="input-error">{errors.confirmPassword}</p>
              )}
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
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          <p className="text-sm text-muted-foreground text-center mt-6">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-primary hover:underline font-medium">
              Login here
            </Link>
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
