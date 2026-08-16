"use client";

import * as React from "react";
import {
  Select as BaseSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import Label from "./Label";

type SelectProps = React.ComponentProps<typeof BaseSelect> & {
  label?: string;
  error?: boolean;
  errorText?: string;
  variant?: "primary" | "secondary";
  placeholder?: string;
  className?: string;
};

const Select = ({
  label,
  error,
  errorText,
  variant = "primary",
  placeholder = "Select an option",
  className,
  ...props
}: SelectProps) => {
  const generatedId = React.useId();
  const selectId = generatedId;

  const variantStyles = {
    primary:
      "border-[#3B4D2F] focus-within:border-[#3B4D2F] focus-within:ring-[#3B4D2F]/30",
    secondary:
      "border-[#cccccc] focus-within:border-[#999999] focus-within:ring-[#999999]/30",
  };

  return (
    <div className="flex flex-col gap-1.5">
      {label && <Label htmlFor={selectId}>{label}</Label>}

      <div className="flex flex-col gap-1">
        <BaseSelect {...props}>
          <SelectTrigger
            id={selectId}
            className={cn(
              "w-full rounded-lg bg-input px-4 py-5 transition-colors",
              "focus-visible:ring-2",
              variantStyles[variant],
              error &&
                "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20",
              className,
            )}
            aria-invalid={error}
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>

          <SelectContent>{props.children}</SelectContent>
        </BaseSelect>

        {error && errorText && (
          <p className="text-left text-sm text-destructive">{errorText}</p>
        )}
      </div>
    </div>
  );
};

Select.displayName = "Select";

export default Select;
