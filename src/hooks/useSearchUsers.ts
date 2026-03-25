import { useQuery } from "@tanstack/react-query";
import supabase from "@/supabase";
import { useSession } from "@/context/SessionContext";

export type SearchedUser = {
  id: string;
  name: string | null;
  username: string;
  avatarUrl: string | null;
  phone: string | null;
};

async function searchUsers(
  query: string,
  currentUserId: string,
): Promise<SearchedUser[]> {
  if (query.length < 2) return [];

  const { data, error } = await supabase
    .from("User")
    .select("id, name, username, avatarUrl, phone")
    .neq("id", currentUserId) // exclude self
    .or(`username.ilike.%${query}%,phone.ilike.%${query}%`)
    .limit(8);

  if (error) throw error;
  return data as SearchedUser[];
}

export const useSearchUsers = (query: string) => {
  const { session } = useSession();
  const currentUserId = session?.user.id ?? "";

  return useQuery({
    queryKey: ["users", "search", query],
    queryFn: () => searchUsers(query, currentUserId),
    enabled: query.length >= 2,
    staleTime: 1000 * 30,
  });
};
