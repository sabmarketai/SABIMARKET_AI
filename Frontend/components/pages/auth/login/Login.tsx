"use client";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import { Lock, Mail, Phone, User } from "lucide-react";
import { useRouter } from "next/navigation";

function Login() {
  const router = useRouter();

  return (
    <div className="">
      <form action="" className="flex flex-col gap-8 py-10">
        <Input
          icon={<Phone />}
          label="Phone"
          name="phone"
          placeholder="Enter Phone Number"
        />
        <Input
          icon={<Lock />}
          label="Password"
          name="password"
          placeholder="Enter Password"
        />
        <Button onClick={() => router.push("/dashboard")}>Login</Button>
      </form>
    </div>
  );
}

export default Login;
