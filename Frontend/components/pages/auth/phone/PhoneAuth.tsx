"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Phone, KeyRound } from "lucide-react";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import { useSendOtp } from "@/features/auth/hooks/useSendOtp";
import { useVerifyOtp } from "@/features/auth/hooks/useVerifyOtp";
import { supabase } from "@/lib/supabase";

export default function PhoneAuth() {
  const router = useRouter();
  const [step, setStep] = React.useState<"phone" | "otp">("phone");
  const [phoneNumber, setPhoneNumber] = React.useState("");
  const [otp, setOtp] = React.useState("");

  const sendOtpMutation = useSendOtp();
  const verifyOtpMutation = useVerifyOtp();

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    sendOtpMutation.mutate(
      { phoneNumber },
      {
        onSuccess: () => {
          toast.success("Code sent. Check your phone.");
          setStep("otp");
        },
        onError: (error) => toast.error(error.message),
      },
    );
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    verifyOtpMutation.mutate(
      { phoneNumber, token: otp },
      {
        onSuccess: async (response) => {
          if (!response.session) {
            toast.error("Could not verify code. Please try again.");
            return;
          }
          await supabase.auth.setSession({
            access_token: response.session.access_token,
            refresh_token: response.session.refresh_token,
          });
          router.push("/dashboard");
        },
        onError: (error) => toast.error(error.message),
      },
    );
  };

  if (step === "otp") {
    return (
      <form onSubmit={handleVerifyOtp} className="flex flex-col gap-6 py-6">
        <Input
          icon={<KeyRound />}
          label="Verification code"
          placeholder="Enter the code sent to your phone"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
        />
        <Button type="submit" disabled={verifyOtpMutation.isPending}>
          {verifyOtpMutation.isPending ? "Verifying..." : "Verify code"}
        </Button>
        <button
          type="button"
          className="text-sm text-primary font-medium"
          onClick={() => setStep("phone")}
        >
          Use a different phone number
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSendOtp} className="flex flex-col gap-6 py-6">
      <Input
        icon={<Phone />}
        label="Phone number"
        placeholder="Enter Phone Number"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
      />
      <Button type="submit" disabled={sendOtpMutation.isPending}>
        {sendOtpMutation.isPending ? "Sending..." : "Send code"}
      </Button>
    </form>
  );
}
