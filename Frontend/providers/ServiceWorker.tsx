"use client";

import { useEffect, type ReactNode } from "react";

export function ServiceWorkerRegistration({
  children,
}: {
  children: ReactNode;
}) {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("SW registered:", registration.scope);
        })
        .catch((err) => {
          console.error("SW registration failed:", err);
        });
    }
  }, []);

  return <>{children}</>;
}
