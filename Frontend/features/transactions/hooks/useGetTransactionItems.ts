import { useQuery } from "@tanstack/react-query";
import { getTransactionItems } from "../api/requests";
import { transactionKeys } from "../api/queryKeys";

export const useGetTransactionItems = (id: string) => {
  return useQuery({
    queryKey: transactionKeys.items(id),
    queryFn: () => getTransactionItems(id),
    enabled: !!id,
  });
};
