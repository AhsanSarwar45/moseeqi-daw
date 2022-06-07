import { useStore } from "@Data/Store";
import { SetUndoStoreState, useUndoStore } from "@Data/UndoStore";
import produce, { applyPatches } from "immer";

export const Undo = () => {
    SetUndoStoreState((draftState) => {
        const pastState = draftState.pastStates.pop();
        if (pastState) {
            console.log("undo");
            useStore.setState(
                applyPatches(useStore.getState(), pastState.inversePatches)
            );
            draftState.futureStates.push(pastState);
        }
    });
};

export const Redo = () => {
    SetUndoStoreState((draftState) => {
        const futureState = draftState.futureStates.pop();
        if (futureState) {
            console.log("redo");
            useStore.setState(
                applyPatches(useStore.getState(), futureState.patches)
            );
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
