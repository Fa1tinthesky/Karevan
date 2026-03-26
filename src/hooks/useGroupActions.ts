import { useMutation, useQueryClient } from "@tanstack/react-query";
import supabase from "@/supabase";
import { useSession } from "@/context/SessionContext";
import { groupDetailKeys } from "./useGroup";
import { groupKeys } from "./useGroups";
import { userKeys } from "@/context/SessionContext";

export const useCommitToGroup = (groupId: string) => {
  const { session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc("commit_to_group", {
        p_group_id: groupId,
        p_user_id: session!.user.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: groupDetailKeys.detail(groupId),
      });
      queryClient.invalidateQueries({ queryKey: groupKeys.all() });
      queryClient.invalidateQueries({ queryKey: userKeys.me() });
    },
  });
};

export const useContributeToGoal = (groupId: string) => {
  const { session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (amount: number) => {
      const { error } = await supabase.rpc("contribute_to_goal", {
        p_group_id: groupId,
        p_user_id: session!.user.id,
        p_amount: amount,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: groupDetailKeys.detail(groupId),
      });
      queryClient.invalidateQueries({ queryKey: groupKeys.all() });
      queryClient.invalidateQueries({ queryKey: userKeys.me() });
    },
  });
};

export const useSendToDestination = (groupId: string) => {
  const { session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc("send_to_destination", {
        p_group_id: groupId,
        p_user_id: session!.user.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: groupDetailKeys.detail(groupId),
      });
      queryClient.invalidateQueries({ queryKey: groupKeys.all() });
      queryClient.invalidateQueries({ queryKey: userKeys.me() });
    },
  });
};

export const useDeleteGroup = (groupId: string) => {
  const { session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc("delete_group", {
        p_group_id: groupId,
        p_user_id: session!.user.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupKeys.all() });
      queryClient.invalidateQueries({ queryKey: userKeys.me() });
    },
  });
};

export const useAddMember = (groupId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      shareAmount,
    }: {
      userId: string;
      shareAmount?: number;
    }) => {
      // Add member
      const { error: memberError } = await supabase.from("GroupMember").insert({
        groupId,
        userId,
        isAdmin: false,
        status: "INVITED",
        shareAmount: shareAmount ?? null,
      });

      if (memberError) throw memberError;

      // Send invite notification
      const { data: group } = await supabase
        .from("Group")
        .select("title")
        .eq("id", groupId)
        .single();

      await supabase.from("Notification").insert({
        userId,
        groupId,
        type: "NEW_INVITE",
        title: "New group invite",
        body: `You were invited to "${group?.title}"`,
        read: false,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: groupDetailKeys.detail(groupId),
      });
    },
  });
};

export const useCancelGroup = (groupId: string) => {
  const { session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc("cancel_group", {
        p_group_id: groupId,
        p_user_id: session!.user.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: groupDetailKeys.detail(groupId),
      });
      queryClient.invalidateQueries({ queryKey: groupKeys.all() });
      queryClient.invalidateQueries({ queryKey: userKeys.me() });
    },
  });
};
