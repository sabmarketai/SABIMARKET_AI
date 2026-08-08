"use client";

import { useQuery } from "@tanstack/react-query";
import { getDashboard } from "../api/requests";
import { dashboardKeys } from "../api/queryKeys";

export const useDashboard = () => {
  return useQuery({
    queryKey: dashboardKeys.overview(),
    queryFn: getDashboard,
  });
};