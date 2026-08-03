"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const finishAuth = async () => {
      const { error } = await supabase.auth.getSession();
      if (!error) {
        router.replace("/");
        return;
      }
      router.replace("/offline");
    };

    finishAuth();
  }, [router]);

  return <div className="p-6 text-sm text-indigo">Finishing sign-in...</div>;
}
