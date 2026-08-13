"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { markNotificationAsRead } from "../api/requests";
import { notificationKeys } from "../api/queryKeys";

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markNotificationAsRead,

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.list() });
      queryClient.invalidateQueries({ queryKey: notificationKeys.unread() });
    },
  });
};
