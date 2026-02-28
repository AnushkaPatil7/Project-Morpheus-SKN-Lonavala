import { useState, useCallback, useEffect } from "react";
import { chatbotApi, type ChatSession, type ChatMessage } from "../api/chatbot.api.ts";

// ─── useChatSessions ──────────────────────────────────────────────────────────
export function useChatSessions() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await chatbotApi.getSessions();
      setSessions(data);
    } catch {}
    finally { setIsLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, []);

  const createSession = async (title?: string) => {
    const session = await chatbotApi.createSession(title || "New Conversation");
    setSessions((prev) => [session, ...prev]);
    return session;
  };

  return { sessions, isLoading, createSession, refetch: fetch };
}

// ─── useChatbot ───────────────────────────────────────────────────────────────
export function useChatbot(sessionId: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAsking, setIsAsking] = useState(false);

  // Load history when session changes
  useEffect(() => {
    if (!sessionId) { setMessages([]); return; }
    setIsLoading(true);
    chatbotApi.getHistory(sessionId)
      .then(setMessages)
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [sessionId]);

  const ask = async (question: string, imageFile?: File) => {
    if (!sessionId) return;
    if (!question.trim() && !imageFile) return;

    setIsAsking(true);

    // Optimistic user message
    const tempUserMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      sessionId,
      role: "user",
      content: question || "Uploaded an image.",
      imageUrl: imageFile ? URL.createObjectURL(imageFile) : null,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const { userMessage, systemMessage } = await chatbotApi.ask(
        sessionId,
        question,
        imageFile
      );
      // Replace temp with real messages
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== tempUserMsg.id),
        userMessage,
        systemMessage,
      ]);
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== tempUserMsg.id));
    } finally {
      setIsAsking(false);
    }
  };

  return { messages, isLoading, isAsking, ask };
}