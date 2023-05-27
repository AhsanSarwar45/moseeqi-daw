import { getState, setState, useStore } from "@data/stores/project";
import {
    resetHistoryState,
    setHistoryState,
    useHistoryState,
} from "@data/stores/history";
import { produce, applyPatches, Patch } from "immer";
import { synchronizeState } from "./state";

export const addToHistory = (
    patches: Patch[],
    inversePatches: Patch[],
    actionName: string,
    addToUndoHistory: boolean
) => {
    const historyState = useHistoryState.getState();
    if (historyState.isHistoryEnabled && addToUndoHistory) {
        // If history had been disabled before this update, we need to cumulate the patches that were
        // made while history was disabled
        if (!historyState.prevHistoryEnabledState) {
            // add the latest patches too
            const patchesWhileDisabled = [
                ...historyState.patchesWhileDisabled,
                ...patches,
            ];
            // Apply all the patches to the state of the store before history was disabled
            // We do this to get the inverse patches too
            console.log(patchesWhileDisabled, getState());
            produce(
                historyState.stateBeforeDisabled,
                (draftState) => {
                    applyPatches(draftState, patchesWhileDisabled);
                },
                (cumulativePatches, cumulativeInversePatches) => {
                    patches = cumulativePatches;
                    inversePatches = cumulativeInversePatches;
                }
            );
        }
        setHistoryState((draftState) => {
            const state = {
                patches: patches,
                inversePatches: inversePatches,
                actionName: actionName,
            };
            draftState.pastStates.push(state);
            // clearing redo states on a new state change is standard practice
            draftState.futureStates = [];
            draftState.patchesWhileDisabled = [];
            draftState.prevHistoryEnabledState = true;
        });
    } else {
        setHistoryState((draftState) => {
            draftState.patchesWhileDisabled.push(...patches);
            draftState.prevHistoryEnabledState = false;
        });
    }
};

export const undo = () => {
    const currentState = getState();
    setHistoryState((draftState) => {
        const pastState = draftState.pastStates.pop();
        if (pastState) {
            console.log(pastState.inversePatches, currentState);
            useStore.setState(
                applyPatches(currentState, pastState.inversePatches)
            );
            synchronizeState(currentState);
            draftState.futureStates.push(pastState);
        }
    });
};

export const redo = () => {
    const currentState = getState();
    setHistoryState((draftState) => {
        const futureState = draftState.futureStates.pop();
        if (futureState) {
            useStore.setState(applyPatches(getState(), futureState.patches));
            synchronizeState(currentState);
            draftState.pastStates.push(futureState);
        }
    });
};

export const clearHistory = () => {
    resetHistoryState();
};

export const disableHistory = () => {
    setHistoryState((draftState) => {
        draftState.isHistoryEnabled = false;
        draftState.stateBeforeDisabled = getState();
    });
};

export const enableHistory = () => {
    setHistoryState((draftState) => {
        draftState.isHistoryEnabled = true;
    });
};
