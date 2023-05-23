import * as Tone from "tone";

import { useStore } from "@Data/Store";
import { ChangeTracksBpm } from "./TrackUtils";
import { setState } from "@Data/Store";

export const SetBpm = (bpm: number) => {
    Tone.Transport.bpm.value = bpm;
    setState((draftState) => {
        ChangeTracksBpm(draftState.tracks, draftState.bpm, bpm);
        draftState.bpm = bpm;
    }, "Change BPM");
};
