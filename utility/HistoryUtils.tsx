import { SetState, useStore } from "@Data/Store";
import { SetHistoryState, useHistoryState } from "@Data/HistoryStore";
import produce, { applyPatches, Patch } from "immer";
import { SynchronizeState } from "./StateUtils";

export const AddToHistory = (
    patches: Patch[],
    inversePatches: Patch[],
    actionName: string,
    addToUndoHistory: boolean
) => {
    const historyState = useHistoryState.getState();
    if (historyState.isHistoryEnabled && addToUndoHistory) {
        // If history had been disabled before this update, we need to apply the patches that were
        // made while history was disabled.
        if (!historyState.prevHistoryEnabledState) {
            // Add the latest patches too
            const patchesWhileDisabled = [
                ...historyState.patchesWhileDisabled,
                ...patches,
            ];
            // Cumulate all patches that were applied while disabled
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
        SetHistoryState((draftState) => {
            const state = {
                patches: patches,
                inversePatches: inversePatches,
                actionName,
            };
            draftState.pastStates.push(state);
            // Clearing redo states on a new state change is standard practice
            draftState.futureStates = [];
            draftState.prevHistoryEnabledState = true;
        });
    } else {
        SetHistoryState((draftState) => {
            draftState.patchesWhileDisabled.push(...patches);
            draftState.prevHistoryEnabledState = false;
        });
    }
};

export const Undo = () => {
    const prevState = useStore.getState();
    SetHistoryState((draftState) => {
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
    SetHistoryState((draftState) => {
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
    SetHistoryState((draftState) => {
        draftState.pastStates = [];
        draftState.futureStates = [];
    });
};

export const DisableHistory = () => {
    SetHistoryState((draftState) => {
        draftState.isHistoryEnabled = false;
        draftState.stateBeforeDisabled = useStore.getState();
    });
};

export const EnableHistory = () => {
    SetHistoryState((draftState) => {
        draftState.isHistoryEnabled = true;
    });
};
