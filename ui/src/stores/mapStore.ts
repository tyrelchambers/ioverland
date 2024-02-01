import { Point } from "@/types";
import { create } from "zustand";

interface Props {
  points: Point[];
  addPoint: (points: Point) => void;
  removePoint: (point: Point) => void;
}
export const useMapStore = create<Props>((set) => ({
  points: [],
  addPoint: (point) =>
    set((state) => ({ ...state, points: [...state.points, point] })),
  removePoint: (point) =>
    set((state) => ({
      ...state,
      points: state.points.filter(
        ({ lat, lng }) => lat !== point.lat && lng !== point.lng
      ),
    })),
}));
