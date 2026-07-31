"use client";
import React, { useState } from "react";
import Login from "../login/Login";
import google from "@/public/svgs/google.svg";
import Button from "@/components/atoms/Button";
import Image from "next/image";
import Signup from "../signup/Signup";

function Auth() {
  const [isLogin, setIsLogin] = useState<boolean>(true);

  const loginWithGoogle = async () => {
    console.log('called goole')
    const redirectTo =
      `${window.location.origin}/auth/callback`;

    const res = await fetch(
      `http://localhost:3001/auth/google?redirectTo=${encodeURIComponent(redirectTo)}`

    );

    const data = await res.json();

    window.location.href = data.url;

  };
  return (
    <div>
      <h1 className="text-3xl">{isLogin ? <span>Log in</span> : <span>Create Account</span>}</h1>
      {isLogin ? <p>Sign in to access your account</p> : <p>Sign up to get started</p>}

      {isLogin ? <Login /> : <Signup />}
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
          {isLogin ? (
            <p>
              Don't have an account?{" "}
              <span className="text-primary" onClick={() => setIsLogin(false)}>
                Signup
              </span>
            </p>
          ) : (
            <p>
              Already have an account?{" "}
              <span className="text-primary" onClick={() => setIsLogin(true)}>
                Login
              </span>
            </p>
          )}
        </p>
      </div>
    </div>
  );
}

export default Auth;
