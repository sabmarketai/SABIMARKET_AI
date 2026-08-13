import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Language } from "./types";

interface SabiMarketState {
  language: Language;
  isOnline: boolean;
  setLanguage: (lang: Language) => void;
  setOnline: (online: boolean) => void;
}

export const useSabiMarketStore = create<SabiMarketState>()(
  persist(
    (set) => ({
      language: "pidgin",
      isOnline: true,
      setLanguage: (language) => set({ language }),
      setOnline: (isOnline) => set({ isOnline }),
    }),
    {
      name: "sabimarket-storage",
    }
  )
);
