import * as React from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "h-12 w-full rounded-control border border-input bg-card px-4 text-[15px] text-foreground outline-none transition-[border-color,box-shadow] placeholder:text-muted-foreground focus:border-foreground focus:ring-4 focus:ring-foreground/5 aria-[invalid=true]:border-destructive disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}
