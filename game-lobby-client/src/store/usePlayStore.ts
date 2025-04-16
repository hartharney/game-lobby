import { create } from "zustand";

type PlayStore = {
  pickedNumber: number | null;
  sessionEndsAt: string | null;
  result: "won" | "lost" | null;
  setPickedNumber: (num: number, endsAt: string) => void;
  setResult: (result: "won" | "lost") => void;
};

export const usePlayStore = create<PlayStore>((set) => ({
  pickedNumber: null,
  sessionEndsAt: null,
  result: null,
  setPickedNumber: (num, endsAt) =>
    set({ pickedNumber: num, sessionEndsAt: endsAt }),
  setResult: (result) => set({ result }),
}));
