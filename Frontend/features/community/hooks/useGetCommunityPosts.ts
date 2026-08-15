import { useQuery } from "@tanstack/react-query";
import { getCommunityPosts } from "../api/requests";
import { communityKeys } from "../api/queryKeys";

export const useGetCommunityPosts = () => {
  return useQuery({
    queryKey: communityKeys.list(),
    queryFn: getCommunityPosts,
  });
};
