// api/request.ts

import { base_url } from "@/app/constants/api";
import {
  LoginPayload,
  LoginResponse,
  LoginSuccessResponse,
  SendOtpPayload,
  SignupPayload,
  SignupResponse,
  SignupSuccessResponse,
  VerifyOtpPayload,
  VerifyOtpSuccessResponse,
} from "../types";

export async function request<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
}

export const login = (payload: LoginPayload) => {
    return request<LoginSuccessResponse>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(payload)
    })
}

export const signup = (payload: SignupPayload) => request<SignupSuccessResponse>(`/api/auth/signup`, {
    method: "POST",
    body: JSON.stringify(payload),
})

export const sendOtp = (payload: SendOtpPayload) =>
  request<{ message: string }>("/api/auth/phone/send-otp", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const verifyOtp = (payload: VerifyOtpPayload) =>
  request<VerifyOtpSuccessResponse>("/api/auth/phone/verify", {
    method: "POST",
    body: JSON.stringify(payload),
  });