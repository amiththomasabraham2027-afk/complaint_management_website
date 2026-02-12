import { cn } from "@/lib/utils/cn";

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning";
}

const badgeVariants: Record<NonNullable<BadgeProps["variant"]>, string> = {
  default: "bg-primary/10 text-primary border-primary/30",
  secondary: "bg-secondary/10 text-secondary border-secondary/30",
  destructive: "bg-accent/10 text-accent border-accent/30",
  outline: "text-foreground border-border",
  success: "bg-green-500/10 text-green-400 border-green-500/30",
  warning: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
};

const Badge = ({ className, variant = "default", ...props }: BadgeProps) => (
  <div
    className={cn(
      "badge-status border",
      badgeVariants[variant],
      className
    )}
    {...props}
  />
);

export { Badge, badgeVariants };
