"use client";
import React from "react";
import Login from "../login/Login";
import google from "@/public/svgs/google.svg";
import Button from "@/components/atoms/Button";
import Image from "next/image";
import Signup from "../signup/Signup";
import PhoneAuth from "../phone/PhoneAuth";
import { useSearchParam } from "@/hooks/useSearchParams";

function Auth() {
  const { getParam, setParam } = useSearchParam();
  const isNewUser = getParam("isNewUser") == "true";
  const [showPhoneAuth, setShowPhoneAuth] = React.useState(false);

  const loginWithGoogle = async () => {
    const redirectTo = `${window.location.origin}/auth/callback`;

    const res = await fetch(
      `/api/auth/google?redirectTo=${encodeURIComponent(redirectTo)}`,
    );

    const data = await res.json();
    window.location.href = data.url;
  };

  return (
    <div className="w-full max-w-sm sm:max-w-md">
      <h1 className="text-2xl font-semibold sm:text-3xl">
        {showPhoneAuth ? (
          <span>Continue with phone</span>
        ) : !isNewUser ? (
          <span>Log in</span>
        ) : (
          <span>Create Account</span>
        )}
      </h1>
      {showPhoneAuth ? (
        <p className="mt-1 text-sm text-muted-foreground sm:text-base">
          We&apos;ll text you a one-time code
        </p>
      ) : !isNewUser ? (
        <p className="mt-1 text-sm text-muted-foreground sm:text-base">
          Sign in to access your account
        </p>
      ) : (
        <p className="mt-1 text-sm text-muted-foreground sm:text-base">
          Sign up to get started
        </p>
      )}

      <div className="mt-6">
        {showPhoneAuth ? (
          <PhoneAuth />
        ) : isNewUser ? (
          <Signup />
        ) : (
          <Login />
        )}
      </div>

      <div className="mt-4">
        <div className="flex flex-col gap-3">
          <p className="text-center text-sm text-muted-foreground">OR</p>
          {!showPhoneAuth && (
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
          )}
          <Button
            variant="outline"
            onClick={() => setShowPhoneAuth((v) => !v)}
          >
            {showPhoneAuth ? "Use email instead" : "Continue with phone"}
          </Button>
        </div>
        {!showPhoneAuth && (
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
        )}
      </div>
    </div>
  );
}

export default Auth;
