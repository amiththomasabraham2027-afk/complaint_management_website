import { cn } from "@/lib/utils/cn";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, ...props }, ref) => (
    <select
      className={cn(
        "glass-input w-full appearance-none cursor-pointer",
        className
      )}
      ref={ref}
      {...props}
    />
  )
);

Select.displayName = "Select";

export { Select };

import React from "react";
