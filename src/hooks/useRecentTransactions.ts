import { useQuery } from "@tanstack/react-query";
import supabase from "@/supabase";
import { useCurrentUser } from "@/context/SessionContext";

export type RecentTransaction = {
  id: string;
  type: string;
  amount: number;
  description: string | null;
  createdAt: string;
  groupId: string | null;
};

async function fetchRecentTransactions(
  walletId: string,
): Promise<RecentTransaction[]> {
  const { data, error } = await supabase
    .from("WalletTransaction")
    .select("id, type, amount, description, createdAt, groupId")
    .eq("walletId", walletId)
    .order("createdAt", { ascending: false })
    .limit(10);

  if (error) throw error;
  return (data as any[]).map((t) => ({
    ...t,
    amount: Number(t.amount),
  }));
}

export const useRecentTransactions = () => {
  const { user } = useCurrentUser();
  const walletId = user?.wallet?.id ?? "";

  return useQuery({
    queryKey: ["transactions", walletId],
    queryFn: () => fetchRecentTransactions(walletId),
    enabled: !!walletId,
    staleTime: 1000 * 60,
  });
};
