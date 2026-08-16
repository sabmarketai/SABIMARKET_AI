// app/onboarding/page.tsx
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { MapPin, Phone, User as UserIcon } from "lucide-react";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import { useEditUserDetails } from "@/features/user/hooks/useEditUserDetails";
import { useDashboard } from "@/features/dashboard/hooks/useDashboard";

interface FormState {
  full_name: string;
  phone_number: string;
  market_location: string;
}

export default function OnboardingPage() {
  const router = useRouter();
  const { data } = useDashboard();
  const { mutate, isPending, error } = useEditUserDetails();

  const [form, setForm] = React.useState<FormState>({
    full_name: "",
    phone_number: "",
    market_location: "",
  });
  const [errors, setErrors] = React.useState<
    Partial<Record<keyof FormState, string>>
  >({});

  // Prefill with whatever Google already gave us (e.g. full_name), without
  // clobbering what the user's already typed
  React.useEffect(() => {
    if (!data?.user) return;
    setForm((prev) => ({
      full_name: prev.full_name || data.user.full_name || "",
      phone_number: prev.phone_number || data.user.phone_number || "",
      market_location: prev.market_location || data.user.market_location || "",
    }));
  }, [data?.user]);

  const handleChange =
    (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

  const validate = () => {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (!form.full_name.trim()) next.full_name = "Please enter your full name";
    if (!form.phone_number.trim()) {
      next.phone_number = "Please enter your phone number";
    } else if (!/^\+?[0-9]{10,14}$/.test(form.phone_number.trim())) {
      next.phone_number = "Enter a valid phone number";
    }
    if (!form.market_location.trim())
      next.market_location = "Please enter your market location";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    mutate(
      {
        fullName: form.full_name,
        phoneNumber: form.phone_number,
        marketLocation: form.market_location,
      },
      {
        onSuccess: () => {
          
          router.push("/dashboard");
        },
      },
    );
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center p-6">
      <div className="mb-8 text-center">
        <h1 className="font-display text-xl font-semibold">
          Just a few more details
        </h1>
        <p className="mt-2 text-sm text-indigo/60">
          We need this to set up your shop and keep your account secure.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Full name"
          placeholder="e.g. Amaka Okafor"
          icon={<UserIcon size={16} />}
          value={form.full_name}
          onChange={handleChange("full_name")}
          error={!!errors.full_name}
          errorText={errors.full_name}
        />

        <Input
          label="Phone number"
          placeholder="e.g. 08012345678"
          type="tel"
          icon={<Phone size={16} />}
          value={form.phone_number}
          onChange={handleChange("phone_number")}
          error={!!errors.phone_number}
          errorText={errors.phone_number}
        />

        <Input
          label="Market location"
          placeholder="e.g. Balogun Market, Lagos"
          icon={<MapPin size={16} />}
          value={form.market_location}
          onChange={handleChange("market_location")}
          error={!!errors.market_location}
          errorText={errors.market_location}
        />

        {error && (
          <p className="text-destructive text-sm text-center">
            Something went wrong saving your details. Please try again.
          </p>
        )}

        <Button type="submit" loading={isPending} className="w-full mt-2">
          Continue
        </Button>
      </form>
    </div>
  );
}
