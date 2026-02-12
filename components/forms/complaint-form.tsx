"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ComplaintSchema, type ComplaintFormData } from "@/lib/validation/schemas";
import { motion } from "framer-motion";
import { AlertCircle, CheckCircle, Loader } from "lucide-react";

interface ComplaintFormProps {
  initialData?: Partial<ComplaintFormData>;
  onSubmit?: (data: ComplaintFormData) => Promise<void>;
  submitButtonText?: string;
}

export function ComplaintForm({
  initialData,
  onSubmit,
  submitButtonText = "Submit Complaint",
}: ComplaintFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<Partial<ComplaintFormData>>({
    title: initialData?.title || "",
    description: initialData?.description || "",
    category: initialData?.category || "Service Quality",
    priority: initialData?.priority || "Medium",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
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
      const validatedData = ComplaintSchema.parse(formData);

      setIsLoading(true);

      if (onSubmit) {
        await onSubmit(validatedData);
        setSuccessMessage("Complaint submitted successfully!");
        setFormData({ title: "", description: "", category: "Service Quality", priority: "Medium" });
        setTimeout(() => router.push("/complaint/history"), 2000);
      } else {
        const response = await fetch("/api/complaints", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(validatedData),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to submit complaint");
        }

        setSuccessMessage("Complaint submitted successfully!");
        setFormData({ title: "", description: "", category: "Service Quality", priority: "Medium" });
        setTimeout(() => router.push("/complaint/history"), 2000);
      }
    } catch (error: any) {
      if (error.errors) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err: any) => {
          newErrors[err.path[0]] = err.message;
        });
        setErrors(newErrors);
      } else {
        setErrorMessage(error.message || "Failed to submit complaint");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onSubmit={handleSubmit}
      className="space-y-6"
    >
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
        <label htmlFor="title" className="label">
          Complaint Title
        </label>
        <Input
          id="title"
          name="title"
          value={formData.title || ""}
          onChange={handleChange}
          placeholder="Brief title of your complaint"
          disabled={isLoading}
        />
        {errors.title && <p className="input-error">{errors.title}</p>}
      </div>

      <div className="form-group">
        <label htmlFor="description" className="label">
          Detailed Description
        </label>
        <Textarea
          id="description"
          name="description"
          value={formData.description || ""}
          onChange={handleChange}
          placeholder="Provide detailed information about your complaint..."
          rows={6}
          disabled={isLoading}
        />
        {errors.description && <p className="input-error">{errors.description}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="form-group">
          <label htmlFor="category" className="label">
            Category
          </label>
          <Select
            id="category"
            name="category"
            value={formData.category || ""}
            onChange={handleChange}
            disabled={isLoading}
          >
            <option value="Service Quality">Service Quality</option>
            <option value="Billing">Billing</option>
            <option value="Product">Product</option>
            <option value="Delivery">Delivery</option>
            <option value="Staff">Staff</option>
            <option value="Facility">Facility</option>
            <option value="Safety">Safety</option>
            <option value="Other">Other</option>
          </Select>
          {errors.category && <p className="input-error">{errors.category}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="priority" className="label">
            Priority Level
          </label>
          <Select
            id="priority"
            name="priority"
            value={formData.priority || ""}
            onChange={handleChange}
            disabled={isLoading}
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </Select>
          {errors.priority && <p className="input-error">{errors.priority}</p>}
        </div>
      </div>

      <Button
        type="submit"
        variant="default"
        size="lg"
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader className="mr-2 h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : (
          submitButtonText
        )}
      </Button>
    </motion.form>
  );
}
