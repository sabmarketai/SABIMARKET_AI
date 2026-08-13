"use client";

import { useEffect, useState } from "react";
import { getCurrentUserId } from "@/lib/session";

export function useCurrentUserId() {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getCurrentUserId().then((id) => {
      if (active) setUserId(id);
    });
    return () => {
      active = false;
    };
  }, []);

  return userId;
}
