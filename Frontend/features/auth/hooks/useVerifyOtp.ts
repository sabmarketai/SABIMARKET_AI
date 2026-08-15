import { useMutation } from "@tanstack/react-query";
import { verifyOtp } from "../api/requests";

export function useVerifyOtp() {
  return useMutation({
    mutationFn: verifyOtp,
  });
}
