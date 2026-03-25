import { useMutation, useQueryClient } from "@tanstack/react-query";
import supabase from "@/supabase";
import { useSession } from "@/context/SessionContext";
import { groupDetailKeys } from "./useGroup";
import { groupKeys } from "./useGroups";

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
    },
  });
};
