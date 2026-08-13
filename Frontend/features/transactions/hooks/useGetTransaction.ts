import { useQuery } from "@tanstack/react-query";
import { getTransaction } from "../api/requests";
import { transactionKeys } from "../api/queryKeys";

export const useGetTransaction = (id: string) => {
  return useQuery({
    queryKey: transactionKeys.detail(id),
    queryFn: () => getTransaction(id),
    enabled: !!id,
  });
};
