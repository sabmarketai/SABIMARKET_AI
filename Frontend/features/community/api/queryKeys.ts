export const communityKeys = {
  all: ["community"] as const,

  lists: () => [...communityKeys.all, "list"] as const,
  list: () => [...communityKeys.lists()] as const,

  details: () => [...communityKeys.all, "detail"] as const,
  detail: (id: string) => [...communityKeys.details(), id] as const,
};
