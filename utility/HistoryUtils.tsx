import { SetState, useStore } from "@Data/Store";
import { SetUndoStoreState, useUndoStore } from "@Data/UndoStore";
import produce, { applyPatches } from "immer";
import { SynchronizeState } from "./StateUtils";

export const Undo = () => {
    const prevState = useStore.getState();
    SetUndoStoreState((draftState) => {
        const pastState = draftState.pastStates.pop();
        if (pastState) {
            useStore.setState(
                applyPatches(useStore.getState(), pastState.inversePatches)
            );
            SynchronizeState(prevState);
            draftState.futureStates.push(pastState);
        }
    });
};

export const Redo = () => {
    const prevState = useStore.getState();
    SetUndoStoreState((draftState) => {
        const futureState = draftState.futureStates.pop();
        if (futureState) {
            useStore.setState(
                applyPatches(useStore.getState(), futureState.patches)
            );
            SynchronizeState(prevState);
            draftState.pastStates.push(futureState);
        }
    });
};

export const ClearHistory = () => {
    SetUndoStoreState((draftState) => {
        draftState.pastStates = [];
        draftState.futureStates = [];
    });
};
