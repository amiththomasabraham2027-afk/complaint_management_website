import mongoose, { Schema, Document, Types } from "mongoose";

interface IComplaint extends Document {
  title: string;
  description: string;
  category: string;
  priority: "Low" | "Medium" | "High";
  status: "Pending" | "In Progress" | "Resolved" | "Rejected";
  userId: Types.ObjectId;
  adminNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const complaintSchema = new Schema<IComplaint>(
  {
    title: {
      type: String,
      required: [true, "Please provide a title"],
      trim: true,
      maxlength: [100, "Title cannot be more than 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Please provide a description"],
      minlength: [10, "Description must be at least 10 characters"],
      maxlength: [2000, "Description cannot be more than 2000 characters"],
    },
    category: {
      type: String,
      enum: [
        "Service Quality",
        "Billing",
        "Product",
        "Delivery",
        "Staff",
        "Facility",
        "Safety",
        "Other",
      ],
      required: [true, "Please provide a category"],
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Resolved", "Rejected"],
      default: "Pending",
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    adminNotes: {
      type: String,
      maxlength: [1000, "Admin notes cannot be more than 1000 characters"],
    },
  },
  {
    timestamps: true,
  }
);

complaintSchema.index({ userId: 1 });
complaintSchema.index({ status: 1 });
complaintSchema.index({ priority: 1 });
complaintSchema.index({ category: 1 });
complaintSchema.index({ createdAt: -1 });

export const Complaint = mongoose.models.Complaint || 
  mongoose.model<IComplaint>("Complaint", complaintSchema);

export type { IComplaint };
