import { useQuery } from "@tanstack/react-query";
import supabase from "@/supabase";
import { useSession } from "@/context/SessionContext";

export type GroupWithMembers = {
  id: string;
  type: "BILL" | "GOAL";
  title: string;
  description: string | null;
  status: string;
  targetAmount: number;
  currentAmount: number;
  category: string | null;
  splitType: string | null;
  destination: string | null;
  deadline: string | null;
  frequency: string | null;
  contributionAmount: number | null;
  visibility: string;
  createdAt: string;
  members: {
    id: string;
    userId: string;
    isAdmin: boolean;
    status: string;
    shareAmount: number | null;
    totalContributed: number;
    user: {
      id: string;
      name: string | null;
      username: string;
      avatarUrl: string | null;
    };
  }[];
};

async function fetchGroups(userId: string): Promise<GroupWithMembers[]> {
  // First get the group IDs this user is actually a member of
  const { data: memberships, error: memberError } = await supabase
    .from("GroupMember")
    .select("groupId")
    .eq("userId", userId)
    .neq("status", "DECLINED"); // declined invites don't show

  if (memberError) throw memberError;
  if (!memberships || memberships.length === 0) return [];

  const groupIds = memberships.map((m) => m.groupId);

  // Now fetch only those groups
  const { data, error } = await supabase
    .from("Group")
    .select(`
      id, type, title, description, status,
      targetAmount, currentAmount, category,
      splitType, destination, deadline, frequency,
      contributionAmount, visibility, createdAt,
      members:GroupMember(
        id, userId, isAdmin, status,
        shareAmount, totalContributed,
        user:User(id, name, username, avatarUrl)
      )
    `)
    .in("id", groupIds)
    .neq("status", "CANCELLED")
    .order("createdAt", { ascending: false });

  if (error) throw error;

  return (data as any[]).map((g) => ({
    ...g,
    targetAmount: Number(g.targetAmount),
    currentAmount: Number(g.currentAmount),
    contributionAmount: g.contributionAmount
      ? Number(g.contributionAmount)
      : null,
    members: (g.members ?? []).map((m: any) => ({
      ...m,
      shareAmount: m.shareAmount ? Number(m.shareAmount) : null,
      totalContributed: Number(m.totalContributed),
      user: Array.isArray(m.user) ? m.user[0] ?? null : m.user,
    })),
  }));
}


export const groupKeys = {
  all: () => ["groups"] as const,
  mine: (userId: string) => ["groups", "mine", userId] as const,
};

export const useGroups = () => {
  const { session } = useSession();
  const userId = session?.user.id ?? "";

  return useQuery({
    queryKey: groupKeys.mine(userId),
    queryFn: () => fetchGroups(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 2,
  });
};
