// lib/onboarding.ts
import { DashboardUser } from "@/features/dashboard/types";

export function isOnboardingIncomplete(user: DashboardUser): boolean {
  return (
    !user.full_name?.trim() ||
    !user.phone_number?.trim() ||
    !user.market_location?.trim()
  );
}