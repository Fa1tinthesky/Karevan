import { RealtimeChat } from "./realtime-chat";

export default function ChatEmbedded() {
    /* const { data: messages } = useMessagesQuery();
    c */
    return <RealtimeChat roomName="default-lobby" username="jane_doe"/>
}
