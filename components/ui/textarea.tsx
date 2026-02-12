import { cn } from "@/lib/utils/cn";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      className={cn(
        "glass-input w-full resize-none",
        className
      )}
      ref={ref}
      {...props}
    />
  )
);

Textarea.displayName = "Textarea";

export { Textarea };

import React from "react";
