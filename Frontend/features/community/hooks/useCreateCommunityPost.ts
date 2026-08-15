"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCommunityPost } from "../api/requests";
import { communityKeys } from "../api/queryKeys";

export const useCreateCommunityPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCommunityPost,

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: communityKeys.list() });
    },
  });
};
