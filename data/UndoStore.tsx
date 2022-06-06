import create from "zustand";
import { StoreState } from "./Store";

export interface HistoryState {
    patch: StoreState;
    actionName: string;
}

interface UndoStoreState {
    pastStates: Array<HistoryState>;
    futureStates: Array<HistoryState>;
}

export const useUndoStore = create<UndoStoreState>()((set) => ({
    pastStates: [],
    futureStates: [],
}));
