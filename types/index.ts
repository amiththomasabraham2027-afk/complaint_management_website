export enum UserRole {
  USER = "user",
  ADMIN = "admin",
}

export enum ComplaintStatus {
  PENDING = "Pending",
  IN_PROGRESS = "In Progress",
  RESOLVED = "Resolved",
  REJECTED = "Rejected",
}

export enum ComplaintPriority {
  LOW = "Low",
  MEDIUM = "Medium",
  HIGH = "High",
}

export enum ComplaintCategory {
  SERVICE_QUALITY = "Service Quality",
  BILLING = "Billing",
  PRODUCT = "Product",
  DELIVERY = "Delivery",
  STAFF = "Staff",
  FACILITY = "Facility",
  SAFETY = "Safety",
  OTHER = "Other",
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface PaginationOptions {
  page: number;
  limit: number;
  skip: number;
}

export interface FilterOptions {
  status?: ComplaintStatus;
  priority?: ComplaintPriority;
  category?: ComplaintCategory;
  userId?: string;
  startDate?: Date;
  endDate?: Date;
  searchTerm?: string;
}
