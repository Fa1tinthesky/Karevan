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
  // 1. Create the group
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

  // 2. Add creator as admin member
  const membersToInsert = [
    {
      groupId: group.id,
      userId: creatorId,
      isAdmin: true,
      status: "COMMITTED", // creator is auto-committed
      shareAmount:
        payload.type === "BILL" && payload.splitType === "EQUAL"
          ? payload.targetAmount / (payload.memberIds.length + 1)
          : null,
    },
    // 3. Add all invited members
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

  // 4. Insert NEW_INVITE notifications for each invited member
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
