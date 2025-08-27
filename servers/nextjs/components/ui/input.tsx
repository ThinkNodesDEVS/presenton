import * as React from "react";

import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-12 w-full rounded-lg border border-light-gray bg-pure-white px-4 py-3 text-body font-inter transition-all duration-200 file:border-0 file:bg-transparent file:text-body file:font-medium file:text-deep-navy placeholder:text-medium-gray focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric-orange focus-visible:ring-offset-2 focus-visible:border-electric-orange disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-light-gray",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
