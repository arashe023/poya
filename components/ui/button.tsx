import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva("focus-ring inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-[10px] px-4 text-sm font-semibold transition active:scale-[.98] disabled:pointer-events-none disabled:opacity-50", {
  variants: {
    variant: {
      default: "bg-[var(--accent)] text-white hover:bg-[var(--accent-strong)] dark:text-[#07130e]",
      outline: "border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] hover:bg-[var(--surface-muted)]",
      ghost: "text-[var(--muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]",
      danger: "bg-[var(--danger)] text-white hover:opacity-90",
    },
    size: { default: "h-10 px-4", sm: "h-8 px-3 text-xs", icon: "h-10 w-10 px-0" },
  }, defaultVariants: { variant: "default", size: "default" },
});

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> { asChild?: boolean }
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, asChild, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
});
Button.displayName = "Button";
