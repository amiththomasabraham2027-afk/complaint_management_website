import { AlertCircle, CheckCircle, Info, XCircle } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type AlertType = "default" | "destructive" | "success" | "info";

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: AlertType;
}

const alertStyles: Record<AlertType, string> = {
  default: "bg-blue-500/10 border-blue-500/30 text-blue-400",
  destructive: "bg-red-500/10 border-red-500/30 text-red-500",
  success: "bg-green-500/10 border-green-500/30 text-green-400",
  info: "bg-cyan-500/10 border-cyan-500/30 text-cyan-400",
};

const Alert = ({ className, type = "default", ...props }: AlertProps) => (
  <div
    role="alert"
    className={cn("glass-card flex items-start space-x-3", alertStyles[type], className)}
    {...props}
  />
);

interface AlertTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

const AlertTitle = ({ className, ...props }: AlertTitleProps) => (
  <h5 className={cn("font-bold", className)} {...props} />
);

interface AlertDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

const AlertDescription = ({
  className,
  ...props
}: AlertDescriptionProps) => (
  <div className={cn("text-sm", className)} {...props} />
);

export { Alert, AlertTitle, AlertDescription };
