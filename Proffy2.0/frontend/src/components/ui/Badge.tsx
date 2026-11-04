import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

export interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "warning" | "danger" | "info" | "primary" | "secondary";
}

export function Badge({ variant = "default", className, ...props }: BadgeProps) {
  const variants = {
    default: "bg-surface text-text-muted border border-border-main",
    primary: "bg-primary text-white border border-primary",
    secondary: "bg-secondary text-white border border-secondary",
    success: "bg-success/10 text-success border border-success/20",
    warning: "bg-warning/10 text-warning border border-warning/20",
    danger: "bg-danger/10 text-danger border border-danger/20",
    info: "bg-info/10 text-info border border-info/20",
  };

  return (
    <div className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold", variants[variant], className)} {...props} />
  );
}
