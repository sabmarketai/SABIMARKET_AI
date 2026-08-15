"use client";

import Loader from "@/components/shared/Loader";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

export default function Callback() {
  const router = useRouter();

  useEffect(() => {
    async function completeLogin() {
      const { data } = await supabase.auth.getSession();

      if (!data.session) {
        router.replace("/");
        return;
      }

      try {
        const response = await fetch("/api/auth/google/complete", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${data.session.access_token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Could not finish Google sign-in");
        }
      } catch {
        toast.error("Could not finish Google sign-in. Please try again.");
        await supabase.auth.signOut();
        router.replace("/");
        return;
      }

      router.replace("/dashboard");
    }

    completeLogin();
  }, [router]);

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <Loader />
    </div>
  );
}
