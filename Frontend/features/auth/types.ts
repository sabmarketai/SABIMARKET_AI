export interface SignupPayload {
  email: string;
  password: string;
  fullName: string;
  phoneNumber: string;
  marketLocation: string;
}

export interface LoginPayload {
    email: string;
    password: string;
}

export interface SignupSuccessResponse {
  message: string;
  user: User;
}

export interface ErrorResponse {
  message: string;
  error: string;
  status: number;
}

export type SignupResponse =
  | SignupSuccessResponse
  | ErrorResponse;

export type LoginResponse = LoginSuccessResponse | ErrorResponse

export interface User {
  id: string;
  aud: string;
  role: string;
  email: string;
  email_confirmed_at: string;
  phone: string;
  app_metadata: AppMetadata;
  user_metadata: UserMetadata;
  identities: Identity[];
  created_at: string;
  updated_at: string;
  is_anonymous: boolean;
}

export interface AppMetadata {
  provider: string;
  providers: string[];
}

export interface UserMetadata {
  email_verified: boolean;
}

export interface Identity {
  identity_id: string;
  id: string;
  user_id: string;
  identity_data: IdentityData;
  provider: string;
  last_sign_in_at: string;
  created_at: string;
  updated_at: string;
  email: string;
}

export interface IdentityData {
  email: string;
  email_verified: boolean;
  phone_verified: boolean;
  sub: string;
}

export interface LoginData {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: User;
}

export interface LoginSuccessResponse {
  message: string;
  data: LoginData;
}

export interface SendOtpPayload {
  phoneNumber: string;
}

export interface VerifyOtpPayload {
  phoneNumber: string;
  token: string;
}

export interface VerifyOtpSuccessResponse {
  user: User | null;
  session: {
    access_token: string;
    refresh_token: string;
    expires_in: number;
  } | null;
}