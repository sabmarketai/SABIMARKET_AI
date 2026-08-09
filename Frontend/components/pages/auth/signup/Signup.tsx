"use client";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import { Lock, Mail, Phone, ShoppingBag, User } from "lucide-react";
import { useSignup } from "@/features/auth/hooks/useSignup";
import { SignupPayload } from "@/features/auth/types";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema } from "@/features/auth/schema";

function Signup() {
  const { mutate, isPending } = useSignup();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupPayload>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = (values: SignupPayload) => {
    mutate(values, {
      onSuccess: () => {
        toast.success("Account created");
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });
  };
  return (
    <div>
      <form
        action=""
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-8 py-10"
      >
        <Input
          icon={<User />}
          label="Name"
          placeholder="Enter Full Name"
          error={!!errors.fullName}
          errorText={errors.fullName?.message}
          {...register("fullName")}
        />
        <Input
          icon={<Mail />}
          label="Email"
          placeholder="Enter Email"
          error={!!errors.email}
          errorText={errors.email?.message}
          {...register("email")}
        />
        <Input
          icon={<Phone />}
          label="Phone"
          placeholder="Enter Phone Number"
          error={!!errors.phoneNumber}
          errorText={errors.phoneNumber?.message}
          {...register("phoneNumber")}
        />
        <Input
          icon={<ShoppingBag />}
          label="Market Location"
          placeholder="Enter Market Location"
          error={!!errors.marketLocation}
          errorText={errors.marketLocation?.message}
          {...register("marketLocation")}
        />
        <Input
          icon={<Lock />}
          label="Password"
          placeholder="Enter Password"
          error={!!errors.password}
          errorText={errors.password?.message}
          {...register("password")}
        />
        <Button type="submit" disabled={isPending}>
          Create Account
        </Button>
      </form>
    </div>
  );
}

export default Signup;
