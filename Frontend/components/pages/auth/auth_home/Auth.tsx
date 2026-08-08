"use client";
import React, { useState } from "react";
import Login from "../login/Login";
import google from "@/public/svgs/google.svg";
import Button from "@/components/atoms/Button";
import Image from "next/image";
import Signup from "../signup/Signup";
import { useSearchParam } from "@/hooks/useSearchParams";

function Auth() {
  // const [isLogin, setIsLogin] = useState<boolean>(true);
  const { getParam, setParam } = useSearchParam();
  const isNewUser = getParam("isNewUser") == "true";

  const loginWithGoogle = async () => {
    console.log("called goole");
    const redirectTo = `${window.location.origin}/auth/callback`;

    const res = await fetch(
      `http://localhost:3001/auth/google?redirectTo=${encodeURIComponent(redirectTo)}`,
    );

    const data = await res.json();

    window.location.href = data.url;
  };
  return (
    <div>
      <h1 className="text-3xl">
        {!isNewUser ? <span>Log in</span> : <span>Create Account</span>}
      </h1>
      {!isNewUser ? (
        <p>Sign in to access your account</p>
      ) : (
        <p>Sign up to get started</p>
      )}

      {isNewUser ? <Signup /> : <Login />}
      <div>
        <div className="flex flex-col gap-2">
          <p className="text-center">OR</p>
          <Button
            iconPosition="left"
            variant="outline"
            onClick={loginWithGoogle}
            icon={
              <Image src={google} width={24} height={24} alt="google_signup" />
            }
          >
            Google
          </Button>
        </div>
        <p className="text-center py-2">
          {!isNewUser ? (
            <span>
              Don't have an account?{" "}
              <span
                className="text-primary"
                onClick={() => setParam("isNewUser", "true")}
              >
                Signup
              </span>
            </span>
          ) : (
            <span>
              Already have an account?{" "}
              <span
                className="text-primary"
                onClick={() => setParam("isNewUser", "false")}
              >
                Login
              </span>
            </span>
          )}
        </p>
      </div>
    </div>
  );
}

export default Auth;
