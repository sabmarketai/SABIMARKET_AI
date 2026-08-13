"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteCommunityPost } from "../api/requests";
import { communityKeys } from "../api/queryKeys";

export const useDeleteCommunityPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCommunityPost,

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: communityKeys.list() });
    },
  });
};
