import { create } from 'zustand';
import { IUnit } from '@/lib/models/unit';
import { deleteUnit as deleteUnitAction } from '@/actions/unit.actions';

interface UnitStore {
  units: IUnit[];
  setUnits: (units: IUnit[]) => void;
  deleteUnit: (unitId: string) => Promise<void>;
}

export const useUnitStore = create<UnitStore>((set, get) => ({
  units: [],
  setUnits: (units) => set({ units }),
  deleteUnit: async (unitId) => {
    try {
      const result = await deleteUnitAction(unitId);
      if (result.success) {
        set((state) => ({
          units: state.units.filter((unit) => unit._id.toString() !== unitId),
        }));
      } else {
        console.error("Failed to delete unit:", result.message);
      }
    } catch (error) {
      console.error("Error deleting unit:", error);
    }
  },
}));