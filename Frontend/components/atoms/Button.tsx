"use client";

import * as React from "react";
import { Button as ShadcnButton } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ButtonProps = Omit<
  React.ComponentProps<typeof ShadcnButton>,
  "variant"
> & {
  loading?: boolean;
  variant?: "primary" | "secondary" | "outline";
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
};

export default function Button({
  children,
  loading,
  className,
  disabled,
  variant = "primary",
  icon,
  iconPosition = "left",
  ...props
}: ButtonProps) {
  const variantStyles = {
    primary: "bg-primary text-white hover:bg-primary/90",
    secondary: "bg-transparent text-secondary",
    outline: "bg-transparent border-input text-foreground",
  };

  return (
    <ShadcnButton
      className={cn(
        "flex items-center gap-2 font-medium rounded-lg px-6 py-5",
        variantStyles[variant],
        className,
      )}
      disabled={loading || disabled}
      {...props}
    >
      {icon && iconPosition === "left" && !loading && (
        <span className="flex items-center justify-center shrink-0">
          {icon}
        </span>
      )}
      {loading ? "Loading..." : children}
      {icon && iconPosition === "right" && !loading && (
        <span className="flex items-center justify-center shrink-0">
          {icon}
        </span>
      )}
    </ShadcnButton>
  );
}
