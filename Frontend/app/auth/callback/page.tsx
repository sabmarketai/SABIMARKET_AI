"use client";

import Loader from "@/components/shared/Loader";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import { base_url } from "@/app/constants/api";

export default function Callback() {
  const router = useRouter();

  useEffect(() => {
    async function completeLogin() {
      try {
        // Get the OAuth code from the URL
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);

          if (error) {
            console.error("OAuth code exchange failed:", error);
            throw error;
          }
        }

        // Now get the Supabase session
        const { data, error } = await supabase.auth.getSession();

        if (error || !data.session) {
          console.error("No Supabase session:", error);
          throw new Error("No Supabase session found");
        }

        // Complete login with NestJS
        const response = await fetch(`/api/auth/google/complete`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${data.session.access_token}`,
          },
        });

        if (!response.ok) {
          const errorBody = await response.text();

          console.error(
            "Backend Google completion failed:",
            response.status,
            errorBody,
          );

          throw new Error("Could not finish Google sign-in");
        }

        // Everything succeeded
        router.replace("/dashboard");
      } catch (error) {
        console.error("Google login failed:", error);

        toast.error("Could not finish Google sign-in. Please try again.");

        await supabase.auth.signOut();

        router.replace("/");
      }
    }

    completeLogin();
  }, [router]);

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <Loader />
    </div>
  );
}
