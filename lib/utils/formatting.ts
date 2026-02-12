export function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getRelativeTime(date: Date): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(then);
}

export function getPriorityColor(
  priority: "Low" | "Medium" | "High"
): string {
  switch (priority) {
    case "Low":
      return "text-blue-400";
    case "Medium":
      return "text-yellow-400";
    case "High":
      return "text-red-500";
    default:
      return "text-gray-400";
  }
}

export function getPriorityBgColor(
  priority: "Low" | "Medium" | "High"
): string {
  switch (priority) {
    case "Low":
      return "bg-blue-500/10 border-blue-500/30";
    case "Medium":
      return "bg-yellow-500/10 border-yellow-500/30";
    case "High":
      return "bg-red-500/10 border-red-500/30";
    default:
      return "bg-gray-500/10 border-gray-500/30";
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "Pending":
      return "text-yellow-400";
    case "In Progress":
      return "text-blue-400";
    case "Resolved":
      return "text-green-400";
    case "Rejected":
      return "text-red-500";
    default:
      return "text-gray-400";
  }
}

export function getStatusBgColor(status: string): string {
  switch (status) {
    case "Pending":
      return "bg-yellow-500/10 border-yellow-500/30";
    case "In Progress":
      return "bg-blue-500/10 border-blue-500/30";
    case "Resolved":
      return "bg-green-500/10 border-green-500/30";
    case "Rejected":
      return "bg-red-500/10 border-red-500/30";
    default:
      return "bg-gray-500/10 border-gray-500/30";
  }
}

export function truncateText(text: string, length: number = 100): string {
  if (text.length <= length) return text;
  return text.substring(0, length) + "...";
}

export function camelCaseToTitleCase(str: string): string {
  return str
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}
