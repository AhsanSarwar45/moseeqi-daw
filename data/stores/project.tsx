import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

import { Track } from "@interfaces/track";
import { createTrackFromIndex } from "@logic/track";
import { bpmToBps, divisorToDuration } from "@logic/time";
import {
    defaultBPM,
    defaultInstrumentIndex,
    defaultProjectLength,
    defaultProjectName,
} from "@data/defaults";
import { initialSecondsPerDivision } from "@data/constants";
import { produce, enableMapSet, enablePatches, Draft } from "immer";
import { Recipe } from "@interfaces/recipe";
import { addToHistory } from "@logic/history";
import { Id, TrackMap } from "@custom-types/types";
import { SelectionSubId } from "@interfaces/selection";

enablePatches();
enableMapSet();

export interface StoreState {
    readonly tracks: TrackMap;

    readonly selectedTracksId: Id[];
    readonly selectedPartsId: SelectionSubId[];
    readonly selectedNotesId: SelectionSubId[];

    readonly bpm: number;

    readonly projectName: string;
    readonly projectLength: number;

    readonly copiedTracksId: Id[];
    readonly copiedPartsId: SelectionSubId[];
    readonly copiedNotesId: SelectionSubId[];
}

export const getDefaultProjectState = (): StoreState => {
    const trackRecord = createTrackFromIndex(defaultInstrumentIndex);
    const [trackId, track] = trackRecord;

    return {
        tracks: new Map<Id, Track>([trackRecord]),
        selectedTracksId: [trackId],
        selectedPartsId: new Array<SelectionSubId>(),
        selectedNotesId: new Array<SelectionSubId>(),
        bpm: defaultBPM,
        projectName: defaultProjectName,
        projectLength: defaultProjectLength,
        copiedTracksId: new Array<Id>(),
        copiedPartsId: new Array<SelectionSubId>(),
        copiedNotesId: new Array<SelectionSubId>(),
    };
};

export const useStore = create<StoreState>()(
    subscribeWithSelector(() => {
        return getDefaultProjectState();
    })
);

export const selectTracks = (state: StoreState) => state.tracks;
export const selectTrackCount = (state: StoreState) => state.tracks.size;

export const selectSelectedTracksIds = (state: StoreState) =>
    state.selectedTracksId;
export const selectSelectedPartsIds = (state: StoreState) =>
    state.selectedPartsId;
export const selectSelectedNotesIds = (state: StoreState) =>
    state.selectedNotesId;
export const selectLastSelectedTrack = (state: StoreState) =>
    state.tracks.get(state.selectedTracksId.slice(-1)[0] ?? -1);
export const selectLastSelectedTrackId = (state: StoreState) =>
    state.selectedTracksId.slice(-1)[0] ?? -1;

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
    state.bpm = defaultBPM;
    state.projectName = defaultProjectName;
    state.projectLength = defaultProjectLength;
    resetSelectionState(state);

    // console.log(state.tracks);
};

export const resetSelectionState = (state: Draft<StoreState>) => {
    state.selectedTracksId.length = 0;
    if (state.tracks.size > 0) {
        state.selectedTracksId.push(Array.from(state.tracks.keys())[0]);
    }
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
