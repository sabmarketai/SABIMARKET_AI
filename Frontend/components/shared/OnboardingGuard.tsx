// components/shared/OnboardingGuard.tsx
"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useDashboard } from "@/features/dashboard/hooks/useDashboard";
import { isOnboardingIncomplete } from "@/lib/onboarding";
import Loader from "@/components/shared/Loader";

const ONBOARDING_PATH = "/onboarding";
const HOME_PATH = "/"; // adjust if your dashboard lives elsewhere

export default function OnboardingGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data, isLoading } = useDashboard();
  const router = useRouter();
  const pathname = usePathname();

  const incomplete = data ? isOnboardingIncomplete(data.user) : false;

  useEffect(() => {
    if (isLoading || !data) return;

    if (incomplete && pathname !== ONBOARDING_PATH) {
      router.replace(ONBOARDING_PATH);
    }
    if (!incomplete && pathname === ONBOARDING_PATH) {
      router.replace(HOME_PATH);
    }
  }, [incomplete, isLoading, data, pathname, router]);

  // Block rendering while we're mid-redirect, so protected screens don't flash
  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }
  if (incomplete && pathname !== ONBOARDING_PATH) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return <>{children}</>;
}