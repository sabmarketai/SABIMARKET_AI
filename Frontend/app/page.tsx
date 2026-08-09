import Auth from "@/components/pages/auth/auth_home/Auth";
import { Suspense } from "react";

function page() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8 sm:px-6">
      <Suspense fallback={null}>
        <Auth />
      </Suspense>
    </div>
  );
}

export default page;
