import { Send } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

import { cn } from '@/lib/utils'
import { ChatMessageItem } from '@/components/chat-message'
import { useChatScroll } from '@/hooks/chat/use-chat-scroll'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import { useRealtimeChat } from '@/hooks/chat/use-realtime-chat'
import { useMessages } from '@/hooks/useMessages'
import { useCurrentUser } from '@/context/SessionContext'
import supabase from '@/supabase';

interface GroupChatProps {
  groupId: string
}

/**
 * Realtime chat component
 * @param roomName - The name of the room to join. Each room is a unique chat.
 * @param username - The username of the user
 * @param onMessage - The callback function to handle the messages. Useful if you want to store the messages in a database.
 * @param messages - The messages to display in the chat. Useful if you want to display messages from a database.
 * @returns The chat component
 */
export const GroupChat = ({
  groupId,
}: GroupChatProps) => {
    const { user } = useCurrentUser();
    const [input, setInput] = useState("");
    const bottomRef = useRef<HTMLDivElement>(null);

    const { data: messages, isLoading } = useMessages(groupId);
    const { sendMessage, isConnected } = useRealtimeChat({
        groupId,
        userId: user!.id,
        username: user!.username
    })

  useEffect(() => {
      console.log(groupId);
      bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages]);

  const handleSend = async () => {
      if (!input.trim()) return
        try {
            await sendMessage(input)
            setInput("")
        } catch (e) {
            console.error("Failed to send:", e);
        }
  }

  if (isLoading) return <div className="text-muted-foreground text-sm p-4">Loading messages...</div>
  
  return (
    <div className="flex flex-col h-full w-full bg-background text-foreground antialiased">
          {/* Connection indicator */}
      <div className="flex items-center gap-1.5 px-4 py-2 border-b border-border">
        <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-muted"}`} />
        <span className="text-xs text-muted-foreground">
          {isConnected ? "Connected" : "Connecting..."}
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence initial={false}>
          {messages?.map((msg) => {
            const isOwn = msg.senderId === user?.id
            const senderName = Array.isArray(msg.sender)
              ? msg.sender[0]?.username
              : msg.sender?.username

            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex flex-col gap-1 ${isOwn ? "items-end" : "items-start"}`}
              >
                {!isOwn && (
                  <span className="text-xs text-muted-foreground px-1">
                    {senderName ?? "Unknown"}
                  </span>
                )}
                <div
                  className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${
                    isOwn
                      ? "gradient-primary text-primary-foreground rounded-br-sm"
                      : "bg-card text-foreground rounded-bl-sm shadow-card"
                  }`}
                >
                  {msg.content}
                </div>
                <span className="text-[10px] text-muted-foreground px-1">
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </motion.div>
            )
          })}
          </AnimatePresence>
          <div ref={bottomRef} />
        </div>
        {/* {allMessages.length === 0 ? ( */}
        {/*   <div className="text-center text-sm text-muted-foreground"> */}
        {/*     No messages yet. Start the conversation! */}
        {/*   </div> */}
        {/* ) : null} */}
        {/* <div className="space-y-1"> */}
        {/*   {allMessages.map((message, index) => { */}
        {/*     const prevMessage = index > 0 ? allMessages[index - 1] : null */}
        {/*     const showHeader = !prevMessage || prevMessage.user.name !== message.user.name */}
        {/**/}
        {/*     return ( */}
        {/*       <div */}
        {/*         key={message.id} */}
        {/*         className="animate-in fade-in slide-in-from-bottom-4 duration-300" */}
        {/*       > */}
        {/*         <ChatMessageItem */}
        {/*           message={message} */}
        {/*           isOwnMessage={message.user.name === username} */}
        {/*           showHeader={showHeader} */}
        {/*         /> */}
        {/*       </div> */}
        {/*     ) */}
        {/*   })} */}
        {/* </div> */}

      {/* <form onSubmit={handleSendMessage} className="flex w-full gap-2 border-t border-border p-4"> */}
      {/*   <Input */}
      {/*     className={cn( */}
      {/*       'rounded-full bg-background text-sm transition-all duration-300', */}
      {/*       isConnected && newMessage.trim() ? 'w-[calc(100%-36px)]' : 'w-full' */}
      {/*     )} */}
      {/*     type="text" */}
      {/*     value={newMessage} */}
      {/*     onChange={(e) => setNewMessage(e.target.value)} */}
      {/*     placeholder="Type a message..." */}
      {/*     disabled={!isConnected} */}
      {/*   /> */}
      {/*   {isConnected && newMessage.trim() && ( */}
      {/*     <Button */}
      {/*       className="aspect-square rounded-full animate-in fade-in slide-in-from-right-4 duration-300" */}
      {/*       type="submit" */}
      {/*       disabled={!isConnected} */}
      {/*     > */}
      {/*       <Send className="size-4" /> */}
      {/*     </Button> */}
      {/*   )} */}
      {/* </form> */}

            {/* Input */}
      <div className="px-4 py-3 border-t border-border flex gap-2 items-center">
        <input
          className="flex-1 bg-secondary rounded-full px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleSend}
          disabled={!input.trim() || !isConnected}
          className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center disabled:opacity-40"
        >
          <Send className="w-4 h-4 text-primary-foreground" />
        </motion.button>
      </div>
    </div>
  )
}
