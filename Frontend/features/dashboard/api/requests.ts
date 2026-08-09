import { authRequest } from "@/lib/authRequest";
import { DashboardResponse } from "../types";

export const getDashboard = () => {
  return authRequest<DashboardResponse>("/api/dashboard");
};