import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "focus-ring inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[11px] text-sm font-semibold transition-[background,box-shadow,transform,border-color] duration-150 active:scale-[.98] disabled:pointer-events-none disabled:opacity-45",
  {
    variants: {
      variant: {
        default: "bg-[var(--accent)] text-[var(--accent-contrast)] shadow-[0_1px_2px_rgba(16,26,22,.14)] hover:bg-[var(--accent-strong)] hover:shadow-[0_6px_18px_-8px_var(--accent)]",
        outline: "border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] hover:border-[var(--border-strong)] hover:bg-[var(--surface-muted)]",
        ghost: "text-[var(--muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]",
        danger: "bg-[var(--danger)] text-white hover:opacity-90",
        soft: "bg-[var(--accent-soft)] text-[var(--accent-strong)] hover:brightness-[.97]",
      },
      size: {
        default: "h-10 px-4",
        sm: "h-9 px-3 text-xs",
        xs: "h-8 px-2.5 text-[11px]",
        icon: "h-10 w-10 px-0",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, asChild, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
});
Button.displayName = "Button";
