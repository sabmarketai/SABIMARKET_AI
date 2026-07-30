import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import { Lock, Mail, Phone, User } from "lucide-react";
import Image from "next/image";
import React from "react";

function Signup() {
  return (
    <div className="">
      <form action="" className="flex flex-col gap-8 py-10">
        <Input
          icon={<User />}
          label="Name"
          name="name"
          placeholder="Enter Full Name"
        />
        <Input
          icon={<Mail />}
          label="Email"
          name="email"
          placeholder="Enter Email"
        />
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
        <Button>Create Account</Button>
      </form>
    </div>
  );
}

export default Signup;
