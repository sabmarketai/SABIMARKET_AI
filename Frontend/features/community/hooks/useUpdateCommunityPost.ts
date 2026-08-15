"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateCommunityPost } from "../api/requests";
import { communityKeys } from "../api/queryKeys";
import { UpdateCommunityPostPayload } from "../types";

export const useUpdateCommunityPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateCommunityPostPayload;
    }) => updateCommunityPost(id, payload),

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: communityKeys.list() });
      queryClient.invalidateQueries({
        queryKey: communityKeys.detail(variables.id),
      });
    },
  });
};
