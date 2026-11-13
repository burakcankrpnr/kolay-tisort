import * as React from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "h-11 w-full border border-ink bg-white px-3 text-base text-ink outline-none placeholder:text-ink/40",
        className,
      )}
      {...props}
    />
  );
}
