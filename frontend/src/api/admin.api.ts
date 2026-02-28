import api from "./axios";

export const adminApi = {
  /** GET /api/admin/tutors — fetch all tutors (all statuses) */
  getAllTutors: async () => {
    const response = await api.get("/api/admin/tutors");
    return response.data;
  },

  /** GET /api/admin/tutors/:id — detailed view of a specific tutor */
  getTutorById: async (tutorId: string) => {
    const response = await api.get(`/api/admin/tutors/${tutorId}`);
    return response.data;
  },

  /** PATCH /api/admin/tutors/:id/review — approve, reject, or suspend a tutor */
  reviewTutor: async (
    tutorId: string,
    status: "approved" | "rejected" | "suspended",
    remarks?: string
  ) => {
    const response = await api.patch(`/api/admin/tutors/${tutorId}/review`, {
      status,
      remarks,
    });
    return response.data;
  },
};
