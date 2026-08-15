import { useQuery } from "@tanstack/react-query";
import { getTransactions } from "../api/requests";
import { transactionKeys } from "../api/queryKeys";

export const useGetTransactions = () => {
  return useQuery({
    queryKey: transactionKeys.list(),
    queryFn: getTransactions,
  });
};
