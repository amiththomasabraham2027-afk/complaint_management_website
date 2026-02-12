import { cn } from "@/lib/utils/cn";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        "glass-input w-full",
        className
      )}
      ref={ref}
      {...props}
    />
  )
);

Input.displayName = "Input";

export { Input };

import React from "react";
