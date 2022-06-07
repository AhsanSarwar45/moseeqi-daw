import { Recipe } from "@Interfaces/Recipe";
import produce, { Patch } from "immer";
import create from "zustand";
import { StoreState } from "./Store";

export interface HistoryState {
    patches: Patch[];
    inversePatches: Patch[];
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

export const SetUndoStoreState = (recipe: Recipe<UndoStoreState>) => {
    useUndoStore.setState(produce(useUndoStore.getState(), recipe));
};
