"use client";

import * as React from "react";
import { Label as ShadcnLabel } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type LabelProps = React.ComponentProps<typeof ShadcnLabel>;

export default function Label({ className, ...props }: LabelProps) {
  return <ShadcnLabel className={cn("text-[#3B4D2F]", className)} {...props} />;
}
