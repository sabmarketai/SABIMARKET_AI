import { useQuery } from "@tanstack/react-query";
import { getUnreadNotifications } from "../api/requests";
import { notificationKeys } from "../api/queryKeys";

export const useGetUnreadNotifications = () => {
  return useQuery({
    queryKey: notificationKeys.unread(),
    queryFn: getUnreadNotifications,
    refetchInterval: 60_000,
  });
};
