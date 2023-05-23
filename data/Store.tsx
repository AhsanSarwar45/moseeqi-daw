import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

import { Track } from "@Interfaces/Track";
import { CreateTrackFromIndex } from "@Utility/TrackUtils";
import { BpmToBps, DivisorToDuration } from "@Utility/TimeUtils";
import {
    defaultBPM,
    defaultInstrumentIndex,
    defaultProjectLength,
    defaultProjectName,
} from "./Defaults";
import { initialSecondsPerDivision } from "./Constants";
import { produce, enableMapSet, enablePatches } from "immer";
import { Recipe } from "@Interfaces/Recipe";
import { AddToHistory } from "@Utility/HistoryUtils";
import { Id, TrackMap } from "@Types/Types";
import { SelectionSubId } from "@Interfaces/Selection";
import { GetHistoryState } from "./HistoryStore";

enablePatches();
enableMapSet();

export interface StoreState {
    readonly tracks: TrackMap;

    readonly selectedTracksId: Id[];
    readonly selectedPartsId: SelectionSubId[];
    readonly selectedNotesId: SelectionSubId[];
    readonly lastSelectedTrackId: Id;

    readonly bpm: number;

    readonly projectName: string;
    readonly projectLength: number;
}

export const useStore = create<StoreState>()(
    subscribeWithSelector(() => {
        const trackRecord = CreateTrackFromIndex(defaultInstrumentIndex);

        return {
            tracks: new Map<Id, Track>([trackRecord]),
            selectedTracksId: new Array<Id>(),
            selectedPartsId: new Array<SelectionSubId>(),
            selectedNotesId: new Array<SelectionSubId>(),
            lastSelectedTrackId: trackRecord[0],
            bpm: defaultBPM,
            projectName: defaultProjectName,
            projectLength: defaultProjectLength,
        };
    })
);

export const selectTracks = (state: StoreState) => state.tracks;
export const selectTrackCount = (state: StoreState) => state.tracks.size;

export const selectSelectedTracks = (state: StoreState) =>
    state.selectedTracksId;
export const selectSelectedParts = (state: StoreState) => state.selectedPartsId;
export const selectSelectedNotes = (state: StoreState) => state.selectedNotesId;
export const selectLastSelectedTrack = (state: StoreState) =>
    state.tracks.get(state.lastSelectedTrackId) as Track;
export const selectLastSelectedTrackId = (state: StoreState) =>
    state.lastSelectedTrackId;

export const selectBpm = (state: StoreState) => state.bpm;
export const selectBps = (state: StoreState) => state.bpm / 60;
export const selectCurrentSecondPerDivision = (state: StoreState) =>
    initialSecondsPerDivision / BpmToBps(state.bpm);

export const selectProjectName = (state: StoreState) => state.projectName;
export const selectProjectLength = (state: StoreState) => state.projectLength;

export const setState = (
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

export const getState = () => {
    return useStore.getState();
};
