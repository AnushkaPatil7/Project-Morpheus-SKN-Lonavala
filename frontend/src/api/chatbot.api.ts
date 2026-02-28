import api from "./axios";

export interface ChatSession {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  role: "user" | "model";
  content: string;
  imageUrl?: string | null;
  createdAt: string;
}

export const chatbotApi = {
  /** POST /api/chatbot/session */
  createSession: async (title?: string): Promise<ChatSession> => {
    const res = await api.post("/api/chatbot/session", { title });
    return res.data.data;
  },

  /** GET /api/chatbot */
  getSessions: async (): Promise<ChatSession[]> => {
    const res = await api.get("/api/chatbot");
    return res.data.data;
  },

  /** GET /api/chatbot/:sessionId */
  getHistory: async (sessionId: string): Promise<ChatMessage[]> => {
    const res = await api.get(`/api/chatbot/${sessionId}`);
    return res.data.data;
  },

  /** POST /api/chatbot/:sessionId/ask — supports optional image */
  ask: async (
    sessionId: string,
    question: string,
    imageFile?: File
  ): Promise<{ userMessage: ChatMessage; systemMessage: ChatMessage }> => {
    const formData = new FormData();
    if (question.trim()) formData.append("question", question.trim());
    if (imageFile) formData.append("image", imageFile);

    const res = await api.post(`/api/chatbot/${sessionId}/ask`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.data;
  },
};