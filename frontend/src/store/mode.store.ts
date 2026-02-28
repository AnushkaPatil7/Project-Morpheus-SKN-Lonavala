import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type StudentMode = "regular" | "exam";

interface ModeStore {
  mode: StudentMode;
  setMode: (mode: StudentMode) => void;
  toggleMode: () => void;
}

export const useModeStore = create<ModeStore>()(
  persist(
    (set, get) => ({
      mode: "regular",
      setMode: (mode) => set({ mode }),
      toggleMode: () =>
        set({ mode: get().mode === "regular" ? "exam" : "regular" }),
    }),
    {
      name: "morpheus-student-mode",
      storage: createJSONStorage(() => localStorage),
    }
  )
);