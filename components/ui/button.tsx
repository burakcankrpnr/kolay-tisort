"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-control px-5 text-sm font-semibold whitespace-nowrap transition-[background-color,color,border-color,transform,box-shadow] duration-200 select-none active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40 aria-busy:cursor-progress",
  {
    variants: {
      variant: {
        default: "bg-foreground text-background hover:bg-foreground/85",
        /** Ana CTA: hover'da marka rengi imleç noktasından dışa doğru dolar. */
        cta: "btn-fill bg-foreground text-background shadow-[0_10px_30px_-12px_hsl(var(--foreground)/0.5)] hover:text-primary-foreground",
        primary: "bg-primary text-primary-foreground hover:bg-primary/90",
        secondary: "bg-secondary text-foreground hover:bg-secondary/70",
        outline: "border border-foreground/80 bg-transparent text-foreground hover:bg-foreground hover:text-background",
        ghost: "bg-transparent text-inherit hover:bg-muted",
        destructive: "bg-destructive text-white hover:bg-destructive/90",
      },
      size: {
        default: "h-11",
        sm: "h-9 px-3",
        lg: "h-13 px-7 text-base",
        icon: "size-11 px-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export function Button({
  className,
  variant,
  size,
  asChild = false,
  loading = false,
  children,
  ...props
}: React.ComponentProps<"button"> & VariantProps<typeof buttonVariants> & { asChild?: boolean; loading?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(buttonVariants({ variant, size }), className)}
      aria-busy={loading || undefined}
      disabled={asChild ? undefined : props.disabled || loading}
      {...props}
    >
      {asChild ? (
        children
      ) : (
        <>
          {loading ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
          {children}
        </>
      )}
    </Comp>
  );
}

export { buttonVariants };
