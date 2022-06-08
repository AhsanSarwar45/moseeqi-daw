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
import { AddToHistory } from "@Utility/HistoryUtils";

export interface StoreState {
    readonly tracks: Array<Track>;
    readonly trackCount: number;
    readonly selectedTrackIndex: number;
    readonly selectedPartIndices: Array<SubSelectionIndex>;
    readonly selectedNoteIndices: Array<SubSelectionIndex>;

    readonly bpm: number;

    readonly projectName: string;
    readonly projectLength: number;
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

enablePatches();

export const SetState = (
    recipe: Recipe<StoreState>,
    actionName: string,
    addToUndoHistory: boolean = true
) => {
    console.log(actionName);

    useStore.setState(
        produce(useStore.getState(), recipe, (patches, inversePatches) =>
            AddToHistory(patches, inversePatches, actionName, addToUndoHistory)
        )
    );
};
