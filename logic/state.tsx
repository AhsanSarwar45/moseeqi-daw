import { getState, setState, StoreState } from "@data/stores/project";
import * as Tone from "tone";
import { synchronizePart as synchronizePart } from "./part";
import { disposeTracks as disposeTracks, getTracksSaveData } from "./track";
import { Draft } from "immer";

export const synchronizeTone = (state: Draft<StoreState> = getState()) => {
    Tone.Transport.bpm.value = state.bpm;
    state.tracks.forEach((track) => {
        track.parts.forEach((part) => {
            synchronizePart(part);
            (part.tonePart as Tone.Part).mute = track.muted || track.soloMuted;
        });
        // TODO: maybe sync sampler
    });
};

export const synchronizeState = (oldState: StoreState) => {
    // Why do we need to dispose tracks?
    disposeTracks(oldState.tracks);
    setState(
        (draftState) => {
            synchronizeTone(draftState);
        },
        "Sync state",
        false
    );
};
