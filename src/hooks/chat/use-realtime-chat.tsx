import { useCallback, useEffect, useRef, useState } from 'react'
import supabase from '@/supabase/index'
import type { Database } from '@/types/database'
import { useQuery, useQueryClient } from '@tanstack/react-query';

type ChatMessage = Database['public']['Tables']['Message']['Row'];
type SendMessagePayload = Database['public']['Tables']['Message']['Insert'];

interface UseRealtimeChatProps {
  groupId: string
  userId: string
  username: string
}

export function useRealtimeChat({ groupId, userId, username }: UseRealtimeChatProps) {
    const [isConnected, setIsConnected] = useState(false)
    const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
    const queryClient = useQueryClient();
    const queryKey = ["Message", groupId];

  /* const [messages, setMessages] = useState<ChatMessage[]>([])
  const [channel, setChannel] = useState<ReturnType<typeof supabase.channel> | null>(null) */

  useEffect(() => {
      const groupName = `group-${groupId}`;
    const channel = supabase.channel(groupName)
      .on(
          'postgres_changes', 
        { 
            event: "INSERT",
            schema: "public",
            table: "Message",
            filter: `groupId=eq.${groupId}`
        }, 
        async (payload) => {
            // setMessages((current) => [...current, payload.payload as ChatMessage])
            const { data } = await supabase
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
                            username,
                            name,
                            avatarUrl
                        )
                `)
                .eq("id", payload.new.id)
                .single()

            if (data) {
                queryClient.setQueryData<ChatMessage[]>(queryKey, (old) =>
                    old ? [...old, data as unknown as ChatMessage] : [data as unknown as ChatMessage])
            }
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true)
        } else {
          setIsConnected(false)
        }
      })

      channelRef.current = channel;

        return () => {
          supabase.removeChannel(channel)
        }
  }, [groupId])

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) return

          const payload: SendMessagePayload = {
              content: content.trim(),
              senderId: userId,
              groupId: groupId,
          }

          const { error } = await supabase
            .from("Message")
            .insert({ ...payload, type: "USER" })

          if (error) throw error
/*
      // Update local state immediately for the sender
      setMessages((current) => [...current, message])

      await channel.send({
        type: 'broadcast',
        event: EVENT_MESSAGE_TYPE,
        payload: message,
      }) */
    },
    [groupId, userId]
  )

  return { sendMessage, isConnected }
}
