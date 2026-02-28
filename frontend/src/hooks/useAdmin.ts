import { useState, useEffect, useCallback } from "react";
import { adminApi } from "../api/admin.api";

export function useAdminTutors() {
  const [tutors, setTutors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchTutors = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await adminApi.getAllTutors();
      setTutors(Array.isArray(data) ? data : []);
    } catch {
      setError("Failed to load tutors.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchTutors(); }, [fetchTutors]);

  const approve = async (tutorId: string, remarks?: string) => {
    setActionLoadingId(tutorId);
    try {
      await adminApi.reviewTutor(tutorId, "approved", remarks);
      setTutors((prev) =>
        prev.map((t) => t.id === tutorId ? { ...t, status: "approved" } : t)
      );
    } catch { setError("Failed to approve tutor."); }
    finally { setActionLoadingId(null); }
  };

  const reject = async (tutorId: string, remarks?: string) => {
    setActionLoadingId(tutorId);
    try {
      await adminApi.reviewTutor(tutorId, "rejected", remarks);
      setTutors((prev) =>
        prev.map((t) => t.id === tutorId ? { ...t, status: "rejected" } : t)
      );
    } catch { setError("Failed to reject tutor."); }
    finally { setActionLoadingId(null); }
  };

  const suspend = async (tutorId: string, remarks?: string) => {
    setActionLoadingId(tutorId);
    try {
      await adminApi.reviewTutor(tutorId, "suspended", remarks);
      setTutors((prev) =>
        prev.map((t) => t.id === tutorId ? { ...t, status: "suspended" } : t)
      );
    } catch { setError("Failed to suspend tutor."); }
    finally { setActionLoadingId(null); }
  };

  const pending = tutors.filter((t) => t.status === "pending");
  const approved = tutors.filter((t) => t.status === "approved");
  const rejected = tutors.filter((t) => t.status === "rejected");
  const suspended = tutors.filter((t) => t.status === "suspended");

  return {
    tutors, pending, approved, rejected, suspended,
    isLoading, error, actionLoadingId,
    approve, reject, suspend,
    refetch: fetchTutors,
  };
}
