import * as Tone from "tone";

import { useStore } from "@data/stores/project";
import { changeTracksBpm } from "./track";
import { setState } from "@data/stores/project";

export const setBpm = (bpm: number) => {
    Tone.Transport.bpm.value = bpm;
    setState((draftState) => {
        changeTracksBpm(draftState.tracks, draftState.bpm, bpm);
        draftState.bpm = bpm;
    }, "Change BPM");
};
