import { Recipe } from "@Interfaces/Recipe";
import { produce, Patch } from "immer";
import { create } from "zustand";
import { StoreState, useStore } from "./Store";

export interface HistoryState {
    readonly patches: Patch[];
    readonly inversePatches: Patch[];
    readonly actionName: string;
}

interface HistoryStoreState {
    readonly pastStates: HistoryState[];
    readonly futureStates: HistoryState[];

    readonly isHistoryEnabled: boolean;
    readonly prevHistoryEnabledState: boolean;
    readonly patchesWhileDisabled: Patch[];
    readonly stateBeforeDisabled: StoreState;
}

export const useHistoryState = create<HistoryStoreState>()(() => ({
    pastStates: [],
    futureStates: [],

    isHistoryEnabled: true,
    prevHistoryEnabledState: true,
    patchesWhileDisabled: [],
    stateBeforeDisabled: {} as any,
}));

export const GetHistoryState = () => useHistoryState.getState();

export const SetHistoryState = (recipe: Recipe<HistoryStoreState>) => {
    useHistoryState.setState(produce(GetHistoryState(), recipe));
};
