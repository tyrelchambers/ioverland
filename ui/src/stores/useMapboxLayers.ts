import { mapBoxStyles } from "@/constants";
import { create } from "zustand";

interface Props {
  config: {
    style: string;
  };
  setConfig: (config: { style: string }) => void;
}

export const useMapboxConfigStore = create<Props>((set) => ({
  config: {
    style: mapBoxStyles.outdoors.style,
  },
  setConfig: (config) =>
    set((state) => ({ ...state.config, config: { ...config } })),
}));
