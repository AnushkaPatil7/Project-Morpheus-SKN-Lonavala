import api from "./axios";

export interface CommunityMessage {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
  sender: {
    id: string;
    name: string;
  };
}

export const communityApi = {
  /** GET /api/community/history?limit=50 */
  getHistory: async (limit = 50): Promise<CommunityMessage[]> => {
    const res = await api.get("/api/community/history", {
      params: { limit },
    });

    // Handle different response shapes
    const data = res.data;
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.messages)) return data.messages;
    return [];
  },
};
