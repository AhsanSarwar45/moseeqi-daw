import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

import { Track } from "@Interfaces/Track";
import { createTrackFromIndex } from "@logic/track";
import { bpmToBps, divisorToDuration } from "@logic/time";
import {
    defaultBPM,
    defaultInstrumentIndex,
    defaultProjectLength,
    defaultProjectName,
} from "@data/Defaults";
import { initialSecondsPerDivision } from "@data/Constants";
import { produce, enableMapSet, enablePatches, Draft } from "immer";
import { Recipe } from "@Interfaces/Recipe";
import { addToHistory } from "@logic/history";
import { Id, TrackMap } from "@Types/Types";
import { SelectionSubId } from "@Interfaces/Selection";

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

export const getDefaultProjectState = (): StoreState => {
    const trackRecord = createTrackFromIndex(defaultInstrumentIndex);

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
};

export const useStore = create<StoreState>()(
    subscribeWithSelector(() => {
        return getDefaultProjectState();
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
    initialSecondsPerDivision / bpmToBps(state.bpm);

export const selectProjectName = (state: StoreState) => state.projectName;
export const selectProjectLength = (state: StoreState) => state.projectLength;

export const resetState = (state: Draft<StoreState>) => {
    const [trackId, track]: [Id, Track] = createTrackFromIndex(
        defaultInstrumentIndex
    );
    state.tracks.set(trackId, track);
    state.lastSelectedTrackId = trackId;
    state.bpm = defaultBPM;
    state.projectName = defaultProjectName;
    state.projectLength = defaultProjectLength;
    resetSelectionState(state);

    // console.log(state.tracks);
};

export const resetSelectionState = (state: Draft<StoreState>) => {
    state.selectedTracksId.length = 0;
    state.selectedPartsId.length = 0;
    state.selectedNotesId.length = 0;
};

export const setState = (
    recipe: Recipe<StoreState>,
    actionName: string,
    addToUndoHistory: boolean = true
) => {
    console.log(actionName);

    useStore.setState(
        produce(useStore.getState(), recipe, (patches, inversePatches) =>
            addToHistory(patches, inversePatches, actionName, addToUndoHistory)
        )
    );
};

export const getState = () => {
    return useStore.getState();
};
