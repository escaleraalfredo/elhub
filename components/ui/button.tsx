import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost";
}

export function Button({ className, variant = "default", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50",
        variant === "default" && "bg-zinc-900 text-white hover:bg-zinc-700",
        variant === "outline" && "border border-zinc-200 bg-transparent hover:bg-zinc-100 hover:text-zinc-900",
        variant === "ghost" && "hover:bg-zinc-100 hover:text-zinc-900",
        className
      )}
      {...props}
    />
  );
}