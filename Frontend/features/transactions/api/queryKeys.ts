export const transactionKeys = {
  all: ["transactions"] as const,

  lists: () => [...transactionKeys.all, "list"] as const,
  list: () => [...transactionKeys.lists()] as const,

  details: () => [...transactionKeys.all, "detail"] as const,
  detail: (id: string) => [...transactionKeys.details(), id] as const,

  items: (id: string) => [...transactionKeys.detail(id), "items"] as const,
};
