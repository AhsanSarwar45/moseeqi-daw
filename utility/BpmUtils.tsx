import * as Tone from "tone";

import { useStore } from "@Data/Store";
import { ChangeTracksBpm } from "./TrackUtils";
import { SetState } from "@Data/SetStoreState";

export const SetBpm = (bpm: number) => {
    Tone.Transport.bpm.value = bpm;
    SetState((draftState) => {
        ChangeTracksBpm(draftState.tracks, draftState.bpm, bpm);
        draftState.bpm = bpm;
    }, "Change BPM");
};
