import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric-orange focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-electric-orange text-pure-white rounded-lg shadow-sm hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0",
        destructive:
          "bg-error-red text-pure-white rounded-lg shadow-sm hover:bg-error-red/90 hover:shadow-lg hover:-translate-y-0.5",
        outline:
          "border-2 border-deep-navy bg-transparent text-deep-navy rounded-lg shadow-sm hover:bg-deep-navy hover:text-pure-white",
        secondary:
          "bg-bright-teal text-pure-white rounded-lg shadow-sm hover:bg-bright-teal/90 hover:shadow-lg hover:-translate-y-0.5",
        ghost: "hover:bg-light-gray hover:text-deep-navy rounded-lg",
        link: "text-electric-orange font-semibold underline-offset-4 hover:underline hover:text-electric-orange/80",
      },
      size: {
        default: "h-11 px-6 py-3 text-body",
        sm: "h-9 px-4 py-2 text-body-small",
        lg: "h-12 px-8 py-4 text-body-large",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
