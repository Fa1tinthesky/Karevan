import { useQuery } from "@tanstack/react-query";
import supabase from "@/supabase";

export type GroupDetail = {
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
  createdBy: string;
  createdAt: string;
  members: {
    id: string;
    userId: string;
    isAdmin: boolean;
    status: string;
    shareAmount: number | null;
    totalContributed: number;
    lockedAt: string | null;
    paidAt: string | null;
    user: {
      id: string;
      name: string | null;
      username: string;
      avatarUrl: string | null;
      phone: string | null;
    };
  }[];
  contributions: {
    id: string;
    userId: string;
    amount: number;
    createdAt: string;
    user: {
      name: string | null;
      username: string;
      avatarUrl: string | null;
    };
  }[];
};

async function fetchGroup(groupId: string): Promise<GroupDetail> {
  const { data, error } = await supabase
    .from("Group")
    .select(
      `
      id, type, title, description, status,
      targetAmount, currentAmount, category,
      splitType, destination, deadline, frequency,
      contributionAmount, visibility, createdBy, createdAt,
      members:GroupMember(
        id, userId, isAdmin, status,
        shareAmount, totalContributed,
        lockedAt, paidAt,
        user:User(id, name, username, avatarUrl, phone)
      ),
      contributions:GroupContribution(
        id, userId, amount, createdAt,
        user:User(name, username, avatarUrl)
      )
    `,
    )
    .eq("id", groupId)
    .single();

  if (error) throw error;

  const raw = data as any;
  return {
    ...raw,
    targetAmount: Number(raw.targetAmount),
    currentAmount: Number(raw.currentAmount),
    contributionAmount: raw.contributionAmount
      ? Number(raw.contributionAmount)
      : null,
    members: raw.members.map((m: any) => ({
      ...m,
      shareAmount: m.shareAmount ? Number(m.shareAmount) : null,
      totalContributed: Number(m.totalContributed),
      user: Array.isArray(m.user) ? (m.user[0] ?? null) : m.user,
    })),
    contributions: raw.contributions
      .map((c: any) => ({
        ...c,
        amount: Number(c.amount),
        user: Array.isArray(c.user) ? (c.user[0] ?? null) : c.user,
      }))
      .sort(
        (a: any, b: any) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
  };
}

export const groupDetailKeys = {
  detail: (id: string) => ["group", id] as const,
};

export const useGroup = (groupId: string) => {
  return useQuery({
    queryKey: groupDetailKeys.detail(groupId),
    queryFn: () => fetchGroup(groupId),
    enabled: !!groupId,
    staleTime: 1000 * 30,
  });
};
