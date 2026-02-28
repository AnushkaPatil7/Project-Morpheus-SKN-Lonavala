import { useState, useEffect, useCallback } from "react";
import { communityApi, type CommunityMessage } from "../api/community.api.ts";
import { useSocketStore } from "../store/socket.store";
import { useAuthStore } from "../store/auth.store";

export function useCommunity() {
  const [messages, setMessages] = useState<CommunityMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [rejectedReason, setRejectedReason] = useState<string | null>(null);
  const { socket } = useSocketStore();
  const { user } = useAuthStore();

  // Load history on mount
  useEffect(() => {
    communityApi.getHistory(50)
      .then((data) => {
        // Extra safety — ensure it's always an array
        setMessages(Array.isArray(data) ? data : []);
      })
      .catch(() => setMessages([]))
      .finally(() => setIsLoading(false));
  }, []);

  // Join community room + listen for socket events
  useEffect(() => {
    if (!socket) return;

    socket.emit("join_community_chat");
    console.log("[Community] Joined community_chat room");

    const onNewMessage = (msg: CommunityMessage) => {
      console.log("[Community] New message received:", msg);
      setMessages((prev) => {
        if (prev.find((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
      setIsSending(false);
    };

    const onRejected = ({ message, reason }: { message: string; reason: string }) => {
      console.log("[Community] Message rejected:", reason);
      setRejectedReason(reason || message || "Message was flagged by AI moderation.");
      setIsSending(false);
      setTimeout(() => setRejectedReason(null), 4000);
    };

    socket.on("new_community_message", onNewMessage);
    socket.on("community_message_rejected", onRejected);

    return () => {
      socket.off("new_community_message", onNewMessage);
      socket.off("community_message_rejected", onRejected);
    };
  }, [socket]);

  const sendMessage = useCallback((content: string) => {
    if (!socket || !content.trim()) return;
    setIsSending(true);
    setRejectedReason(null);
    console.log("[Community] Sending message:", content);
    socket.emit("send_community_message", { content: content.trim() });

    // Safety timeout — reset isSending if no response in 5s
    setTimeout(() => setIsSending(false), 5000);
  }, [socket]);

  return {
    messages,
    isLoading,
    isSending,
    rejectedReason,
    sendMessage,
    currentUserId: user?.id,
  };
}
