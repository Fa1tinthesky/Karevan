import { useMutation, useQueryClient } from "@tanstack/react-query";
import supabase from "@/supabase";
import { useSession } from "@/context/SessionContext";
import { groupKeys } from "./useGroups";

export type CreateGroupPayload = {
  // shared
  type: "BILL" | "GOAL";
  title: string;
  description?: string;
  targetAmount: number;
  memberIds: string[]; // user ids to invite

  // BILL only
  category?: string;
  splitType?: "EQUAL" | "CUSTOM";
  destination?: string;
  deadline?: string | null;

  // GOAL only
  frequency?: "DAILY" | "WEEKLY" | "MONTHLY";
  contributionAmount?: number;
  visibility?: "PRIVATE" | "COLLABORATIVE" | "PUBLIC";
};

async function createGroup(payload: CreateGroupPayload, creatorId: string) {
  // Check creator can afford their own share before creating
  if (payload.type === "BILL" && payload.splitType === "EQUAL") {
    const shareAmount = payload.targetAmount / (payload.memberIds.length + 1);

    const { data: wallet, error: walletError } = await supabase
      .from("Wallet")
      .select("balance")
      .eq("userId", creatorId)
      .single();

    if (walletError) throw walletError;

    if (Number(wallet.balance) < shareAmount) {
      throw new Error(
        `Insufficient balance. Your share would be ${shareAmount.toFixed(2)} TJS but you only have ${Number(wallet.balance).toFixed(2)} TJS.`,
      );
    }
  }

  // Rest of the existing creation logic unchanged
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

  const membersToInsert = [
    {
      groupId: group.id,
      userId: creatorId,
      isAdmin: true,
      status: "COMMITTED",
      shareAmount:
        payload.type === "BILL" && payload.splitType === "EQUAL"
          ? payload.targetAmount / (payload.memberIds.length + 1)
          : payload.type === "BILL" && payload.splitType === "CUSTOM"
            ? null
            : null,
    },
    ...payload.memberIds.map((userId) => ({
      groupId: group.id,
      userId,
      isAdmin: false,
      status: "INVITED",
      shareAmount:
        payload.type === "BILL" && payload.splitType === "EQUAL"
          ? payload.targetAmount / (payload.memberIds.length + 1)
          : null,
    })),
  ];

  const { error: membersError } = await supabase
    .from("GroupMember")
    .insert(membersToInsert);

  if (membersError) throw membersError;

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
