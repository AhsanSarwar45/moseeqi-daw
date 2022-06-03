import { Panel } from "@Interfaces/enums/Panel";
import create from "zustand";

interface FocusAreaStoreState {
    focusArea: Panel;
    setFocusArea: (panel: Panel) => void;
}

export const useFocusAreaStore = create<FocusAreaStoreState>()((set) => ({
    focusArea: Panel.None,
    setFocusArea: (panel: Panel) => {
        set((prev) => {
            // console.log("setFocusArea", panel);
            return {
                focusArea: panel,
            };
        });
    },
}));

export const selectFocusArea = (state: FocusAreaStoreState) => state.focusArea;
export const selectSetFocusArea = (state: FocusAreaStoreState) =>
    state.setFocusArea;
