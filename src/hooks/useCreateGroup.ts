import { useMutation, useQueryClient } from "@tanstack/react-query";
import supabase from "@/supabase";
import { useSession } from "@/context/SessionContext";
import { groupKeys } from "./useGroups";

export type CreateGroupPayload = {
  type: "BILL" | "GOAL";
  title: string;
  description?: string;
  targetAmount: number;
  memberIds: string[];

  // BILL only
  category?: string;
  splitType?: "EQUAL" | "CUSTOM";
  destination?: string;
  deadline?: string | null;
  // custom shares keyed by userId (includes admin)
  memberShares?: Record<string, number>;

  // GOAL only
  frequency?: "DAILY" | "WEEKLY" | "MONTHLY";
  contributionAmount?: number;
  visibility?: "PRIVATE" | "COLLABORATIVE" | "PUBLIC";
};

async function createGroup(payload: CreateGroupPayload, creatorId: string) {
  // ── 1. Fetch admin wallet balance ──────────────────────────
  const { data: wallet, error: walletError } = await supabase
    .from("Wallet")
    .select("id, balance")
    .eq("userId", creatorId)
    .single();

  if (walletError || !wallet) throw new Error("Could not fetch your wallet");

  const totalMembers = payload.memberIds.length + 1; // +1 for admin

  // ── 2. Compute admin share & validate balance ──────────────
  let adminShare: number | null = null;

  if (payload.type === "BILL") {
    if (payload.splitType === "EQUAL") {
      adminShare = payload.targetAmount / totalMembers;
    } else if (payload.splitType === "CUSTOM") {
      adminShare = payload.memberShares?.[creatorId] ?? null;
    }

    if (adminShare === null) {
      throw new Error("Admin share amount is not set");
    }
    if (adminShare > Number(wallet.balance)) {
      throw new Error(
        `Insufficient balance. Your share is ${adminShare.toLocaleString()} TJS but your balance is ${Number(wallet.balance).toLocaleString()} TJS`,
      );
    }
  }

  // ── 3. Create the group ────────────────────────────────────
  const { data: group, error: groupError } = await supabase
    .from("Group")
    .insert({
      createdBy: creatorId,
      type: payload.type,
      title: payload.title,
      description: payload.description ?? null,
      targetAmount: payload.targetAmount,
      category: payload.category ?? null,
      splitType: payload.splitType ?? null,
      destination: payload.destination ?? null,
      deadline: payload.deadline ?? null,
      frequency: payload.frequency ?? null,
      contributionAmount: payload.contributionAmount ?? null,
      visibility: payload.visibility ?? "PRIVATE",
    })
    .select()
    .single();

  if (groupError) throw groupError;

  // ── 4. Insert members — admin as INVITED (RPC will commit) ─
  const membersToInsert = [
    {
      groupId: group.id,
      userId: creatorId,
      isAdmin: true,
      status: "INVITED", // ← key change: NOT "COMMITTED"
      shareAmount: adminShare,
    },
    ...payload.memberIds.map((userId) => {
      let share: number | null = null;
      if (payload.type === "BILL") {
        if (payload.splitType === "EQUAL") {
          share = payload.targetAmount / totalMembers;
        } else if (payload.splitType === "CUSTOM") {
          share = payload.memberShares?.[userId] ?? null;
        }
      }
      return {
        groupId: group.id,
        userId,
        isAdmin: false,
        status: "INVITED",
        shareAmount: share,
      };
    }),
  ];

  const { error: membersError } = await supabase
    .from("GroupMember")
    .insert(membersToInsert);

  if (membersError) throw membersError;

  // ── 5. Auto-commit admin via RPC (locks wallet, updates currentAmount) ─
  if (payload.type === "BILL") {
    const { error: commitError } = await supabase.rpc("commit_to_group", {
      p_group_id: group.id,
      p_user_id: creatorId,
    });
    if (commitError) throw commitError;
  }

  // ── 6. Notifications for invited members ──────────────────
  if (payload.memberIds.length > 0) {
    const notifications = payload.memberIds.map((userId) => ({
      userId,
      groupId: group.id,
      type: "NEW_INVITE",
      title: `New ${payload.type === "BILL" ? "bill" : "goal"} invite`,
      body: `You were invited to "${payload.title}"`,
      read: false,
    }));
    await supabase.from("Notification").insert(notifications);
  }

  return group;
}

export const useCreateGroup = () => {
  const { session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateGroupPayload) => {
      if (!session?.user.id) throw new Error("No session");
      return createGroup(payload, session.user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupKeys.all() });
    },
  });
};
