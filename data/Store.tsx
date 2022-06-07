import create from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

import { Track } from "@Interfaces/Track";
import { CreateTrackFromIndex } from "@Utility/TrackUtils";
import { SelectionType, SubSelectionIndex } from "@Interfaces/Selection";
import { BpmToBps, DivisorToDuration } from "@Utility/TimeUtils";
import {
    defaultBPM,
    defaultInstrumentIndex,
    defaultProjectLength,
    defaultProjectName,
} from "./Defaults";
import { initialSecondsPerDivision } from "./Constants";
import produce, { enablePatches } from "immer";
import { Recipe } from "@Interfaces/Recipe";
import { useUndoStore } from "./UndoStore";

export interface StoreState {
    tracks: Array<Track>;
    trackCount: number;
    selectedTrackIndex: number;
    selectedPartIndices: Array<SubSelectionIndex>;
    selectedNoteIndices: Array<SubSelectionIndex>;

    bpm: number;

    projectName: string;
    projectLength: number;
}

export const useStore = create<StoreState>()(
    subscribeWithSelector((set, get) => ({
        tracks: [CreateTrackFromIndex(defaultInstrumentIndex)],
        trackCount: 1,
        selectedTrackIndex: 0,
        selectedPartIndices: [],
        selectedNoteIndices: [],
        bpm: defaultBPM,
        projectName: defaultProjectName,
        projectLength: defaultProjectLength,
    }))
);

export const selectTracks = (state: StoreState) => state.tracks;
export const selectSelectedTrack = (state: StoreState) =>
    state.tracks[state.selectedTrackIndex];
export const selectTrackCount = (state: StoreState) => state.trackCount;
export const selectSelectedPartIndices = (state: StoreState) =>
    state.selectedPartIndices;
export const selectSelectedNoteIndices = (state: StoreState) =>
    state.selectedNoteIndices;
export const selectSelectedTrackIndex = (state: StoreState) =>
    state.selectedTrackIndex;

export const selectBpm = (state: StoreState) => state.bpm;
export const selectBps = (state: StoreState) => state.bpm / 60;
export const selectCurrentSecondPerDivision = (state: StoreState) =>
    initialSecondsPerDivision / BpmToBps(state.bpm);

export const selectProjectName = (state: StoreState) => state.projectName;
export const selectProjectLength = (state: StoreState) => state.projectLength;

let isUndoHistoryEnabled = true;

export const DisableUndoHistory = () => {
    isUndoHistoryEnabled = false;
};

export const EnableUndoHistory = () => {
    isUndoHistoryEnabled = true;
};

enablePatches();

export const SetState = (
    recipe: Recipe<StoreState>,
    actionName: string,
    addToUndoHistory: boolean = true
) => {
    console.log(actionName);
    useStore.setState(
        produce(useStore.getState(), recipe, (patches, inversePatches) => {
            if (isUndoHistoryEnabled && addToUndoHistory) {
                useUndoStore.setState(
                    produce(useUndoStore.getState(), (draftState) => {
                        const state = {
                            patches: patches,
                            inversePatches: inversePatches,
                            actionName,
                        };
                        draftState.pastStates.push(state);
                        draftState.futureStates = [];
                        console.log(state);
                    })
                );
            }
        })
    );
};
