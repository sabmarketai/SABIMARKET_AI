import { useQuery } from "@tanstack/react-query";
import { getNotifications } from "../api/requests";
import { notificationKeys } from "../api/queryKeys";

export const useGetNotifications = () => {
  return useQuery({
    queryKey: notificationKeys.list(),
    queryFn: getNotifications,
  });
};
