import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import supabase from "@/supabase";
import { useSession } from "@/context/SessionContext";
import { groupKeys } from "./useGroups";
import { userKeys } from "../context/SessionContext";

export type AppNotification = {
  id: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
  groupId: string | null;
  group: {
    id: string;
    title: string;
    type: string;
  } | null;
};

async function fetchNotifications(userId: string): Promise<AppNotification[]> {
  const { data, error } = await supabase
    .from("Notification")
    .select(
      `
      id, type, title, body, read, createdAt, groupId,
      group:Group(id, title, type)
    `,
    )
    .eq("userId", userId)
    .order("createdAt", { ascending: false })
    .limit(50);

  if (error) throw error;
  return (data as any[]).map((n) => ({
    ...n,
    group: Array.isArray(n.group) ? (n.group[0] ?? null) : n.group,
  }));
}

export const notificationKeys = {
  all: () => ["notifications"] as const,
  mine: (userId: string) => ["notifications", "mine", userId] as const,
};

export const useNotifications = () => {
  const { session } = useSession();
  const userId = session?.user.id ?? "";

  return useQuery({
    queryKey: notificationKeys.mine(userId),
    queryFn: () => fetchNotifications(userId),
    enabled: !!userId,
    staleTime: 1000 * 30,
  });
};

export const useUnreadCount = () => {
  const { data = [] } = useNotifications();
  return data.filter((n) => !n.read).length;
};

// Mark all as read
export const useMarkAllRead = () => {
  const { session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("Notification")
        .update({ read: true })
        .eq("userId", session!.user.id)
        .eq("read", false);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all() });
    },
  });
};

export const useAcceptInvite = () => {
  const { session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      groupId,
      notificationId,
    }: {
      groupId: string;
      notificationId: string;
    }) => {
      // Call the RPC — this checks balance and locks money properly
      const { error } = await supabase.rpc("commit_to_group", {
        p_group_id: groupId,
        p_user_id: session!.user.id,
      });

      if (error) throw error;

      // Mark notification as read
      await supabase
        .from("Notification")
        .update({ read: true })
        .eq("id", notificationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all() });
      queryClient.invalidateQueries({ queryKey: groupKeys.all() });
      queryClient.invalidateQueries({ queryKey: userKeys.me() });
    },
  });
};

export const useDeclineInvite = () => {
  const { session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      groupId,
      notificationId,
    }: {
      groupId: string;
      notificationId: string;
    }) => {
      const { error } = await supabase
        .from("GroupMember")
        .update({ status: "DECLINED" })
        .eq("groupId", groupId)
        .eq("userId", session!.user.id);

      if (error) throw error;

      await supabase
        .from("Notification")
        .update({ read: true })
        .eq("id", notificationId);

      return notificationId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all() });
      queryClient.invalidateQueries({ queryKey: groupKeys.all() });
    },
  });
};
