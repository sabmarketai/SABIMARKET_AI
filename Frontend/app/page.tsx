import Auth from "@/components/pages/auth/auth_home/Auth";
import Loader from "@/components/shared/Loader";
import { Suspense } from "react";

function page() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8 sm:px-6">
      <Suspense
        fallback={
          <div className="w-full h-screen flex items-center justify-center">
            <Loader />
          </div>
        }
      >
        <Auth />
      </Suspense>
    </div>
  );
}

export default page;
