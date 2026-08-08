"use client";
import React from "react";
import Login from "../login/Login";
import google from "@/public/svgs/google.svg";
import Button from "@/components/atoms/Button";
import Image from "next/image";
import Signup from "../signup/Signup";
import { useSearchParam } from "@/hooks/useSearchParams";
import { base_url } from "@/app/constants/api";

function Auth() {
  const { getParam, setParam } = useSearchParam();
  const isNewUser = getParam("isNewUser") == "true";

  const loginWithGoogle = async () => {
    const redirectTo = `${window.location.origin}/auth/callback`;

    const res = await fetch(
      `${base_url}/auth/google?redirectTo=${encodeURIComponent(redirectTo)}`,
    );

    const data = await res.json();
    window.location.href = data.url;
  };

  return (
    <div className="w-full max-w-sm sm:max-w-md">
      <h1 className="text-2xl font-semibold sm:text-3xl">
        {!isNewUser ? <span>Log in</span> : <span>Create Account</span>}
      </h1>
      {!isNewUser ? (
        <p className="mt-1 text-sm text-muted-foreground sm:text-base">
          Sign in to access your account
        </p>
      ) : (
        <p className="mt-1 text-sm text-muted-foreground sm:text-base">
          Sign up to get started
        </p>
      )}

      <div className="mt-6">{isNewUser ? <Signup /> : <Login />}</div>

      <div className="mt-4">
        <div className="flex flex-col gap-3">
          <p className="text-center text-sm text-muted-foreground">OR</p>
          <Button
            iconPosition="left"
            variant="outline"
            onClick={loginWithGoogle}
            icon={
              <Image src={google} width={20} height={20} alt="google_signup" />
            }
          >
            Google
          </Button>
        </div>
        <p className="py-3 text-center text-sm">
          {!isNewUser ? (
            <span>
              Don&apos;t have an account?{" "}
              <button
                type="button"
                className="text-primary font-medium"
                onClick={() => setParam("isNewUser", "true")}
              >
                Signup
              </button>
            </span>
          ) : (
            <span>
              Already have an account?{" "}
              <button
                type="button"
                className="text-primary font-medium"
                onClick={() => setParam("isNewUser", "false")}
              >
                Login
              </button>
            </span>
          )}
        </p>
      </div>
    </div>
  );
}

export default Auth;
