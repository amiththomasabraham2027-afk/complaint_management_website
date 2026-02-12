import { cn } from "@/lib/utils/cn";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

const Card = ({ className, ...props }: CardProps) => (
  <div className={cn("glass-card", className)} {...props} />
);

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

const CardHeader = ({ className, ...props }: CardHeaderProps) => (
  <div className={cn("flex flex-col space-y-1.5 mb-4", className)} {...props} />
);

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

const CardTitle = ({ className, ...props }: CardTitleProps) => (
  <h2 className={cn("text-2xl font-bold neon-text", className)} {...props} />
);

interface CardDescriptionProps
  extends React.HTMLAttributes<HTMLParagraphElement> {}

const CardDescription = ({
  className,
  ...props
}: CardDescriptionProps) => (
  <p className={cn("text-sm text-muted-foreground", className)} {...props} />
);

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

const CardContent = ({ className, ...props }: CardContentProps) => (
  <div className={className} {...props} />
);

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

const CardFooter = ({ className, ...props }: CardFooterProps) => (
  <div className={cn("flex items-center justify-between pt-4 border-t border-border", className)} {...props} />
);

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
