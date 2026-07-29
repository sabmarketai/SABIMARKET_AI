"use client";

import * as React from "react";
import { Input as ShadcnInput } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import Label from "./Label";

type InputProps = Omit<React.ComponentProps<typeof ShadcnInput>, "variant"> & {
  error?: boolean;
  variant?: "primary" | "secondary";
  label?: string;
  icon?: React.ReactNode;
};

export default function Input({
  className,
  disabled,
  error,
  variant = "primary",
  label,
  icon,
  id,
  ...props
}: InputProps) {
  const variantStyles = {
    primary:
      "border-[#3B4D2F] focus-within:border-[#3B4D2F] focus-within:ring-[#3B4D2F]/30",
    secondary:
      "border-[#cccccc] focus-within:border-[#999999] focus-within:ring-[#999999]/30",
  };

  const generatedId = React.useId();
  const inputId = id ?? generatedId;

  const input = (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg bg-input border-none px-4 transition-colors focus-within:ring-3",
        variantStyles[variant],
        error &&
          "border-destructive focus-within:border-destructive focus-within:ring-destructive/20",
        disabled && "opacity-50 pointer-events-none",
        className,
      )}
    >
      {icon && (
        <span className="flex items-center justify-center text-muted-foreground shrink-0">
          {icon}
        </span>
      )}
      <ShadcnInput
        id={inputId}
        className="rounded-none border-none bg-transparent px-0 py-5 focus-visible:ring-0 focus-visible:border-none"
        disabled={disabled}
        aria-invalid={error}
        {...props}
      />
    </div>
  );

  if (!label) return input;

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={inputId}>{label}</Label>
      {input}
    </div>
  );
}