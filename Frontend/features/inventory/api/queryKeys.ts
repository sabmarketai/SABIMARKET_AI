export const inventoryKeys = {
  all: ["inventory"] as const,

  lists: () => [...inventoryKeys.all, "list"] as const,

  list: () => [...inventoryKeys.lists()] as const,
};