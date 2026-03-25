import { useQuery } from "@tanstack/react-query";
import supabase from "@/supabase";
import type { Database } from "@/types/database";

type ChatMessage = Database['public']['Tables']['Message']['Row'];

    /* content: string;
    createdAt: string;
    groupId: string;
    id: string;
    senderId: string | null;
    type: Database["public"]["Enums"]["MessageType"]; */

export async function fetchMessages(groupId: string) {
    const { data, error } = await supabase
        .from("Message")
        .select(`
                id,
                content,
                senderId,
                groupId,
                type,
                createdAt,
                sender:User(
                    id, 
                    name,
                    username,
                    avatarUrl
                )
                `)
                .eq("groupId", groupId)
                .order("createdAt", { ascending: true})

        if (error) throw error
            return data as unknown as ChatMessage[];
}

export const useMessages = (groupId: string) => {
    return useQuery({
        queryKey: ["Message", groupId],
        queryFn: () => fetchMessages(groupId),
            enabled: !!groupId,
    })
}
