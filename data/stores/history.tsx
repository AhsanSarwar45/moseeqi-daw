import { Recipe } from "@interfaces/recipe";
import { produce, Patch } from "immer";
import { create } from "zustand";
import { StoreState, useStore } from "./project";

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

export const getDefaultHistoryState = (): HistoryStoreState => ({
    pastStates: [],
    futureStates: [],

    isHistoryEnabled: true,
    prevHistoryEnabledState: true,
    patchesWhileDisabled: [],
    stateBeforeDisabled: {} as any,
});

export const useHistoryState = create<HistoryStoreState>()(() =>
    getDefaultHistoryState()
);

export const getHistoryState = () => useHistoryState.getState();

export const setHistoryState = (recipe: Recipe<HistoryStoreState>) => {
    useHistoryState.setState(produce(getHistoryState(), recipe));
};

export const resetHistoryState = () => {
    setHistoryState((draftState) => {
        draftState.pastStates = [];
        draftState.futureStates = [];
        draftState.isHistoryEnabled = true;
        draftState.prevHistoryEnabledState = true;
        draftState.patchesWhileDisabled = [];
        draftState.stateBeforeDisabled = {} as any;
    });
};
