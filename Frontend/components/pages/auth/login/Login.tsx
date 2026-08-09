"use client";

import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import { useLogin } from "@/features/auth/hooks/useLogin";
import { loginSchema } from "@/features/auth/schema";
import { LoginPayload, LoginResponse } from "@/features/auth/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

function Login() {
  const router = useRouter();

  const { mutate, isPending, data } = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginPayload>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (values: LoginPayload) => {
    mutate(values, {
      onSuccess: (response) => {
        sessionStorage.setItem("accessToken", response.data.accessToken);
        router.push("/dashboard");
      },
    });
  };

  const onError = (errors: any) => {
    console.log("Validation errors:", errors);
  };

  return (
    <div>
      <form
        onSubmit={handleSubmit(onSubmit, onError)}
        className="flex flex-col gap-8 py-10"
      >
        <Input
          {...register("email")}
          icon={<Mail />}
          label="Email"
          placeholder="Enter Email"
          error={!!errors.email}
          errorText={errors.email?.message}
        />

        <Input
          {...register("password")}
          icon={<Lock />}
          label="Password"
          placeholder="Enter Password"
          type="password"
          error={!!errors.password}
          errorText={errors.password?.message}
        />

        <Button disabled={isPending} type="submit">
          {isPending ? "Loading..." : "Log in"}
        </Button>
      </form>
    </div>
  );
}

export default Login;
