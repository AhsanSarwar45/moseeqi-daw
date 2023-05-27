import * as Tone from "tone";

import { useStore } from "@data/stores/project";
import { changeTracksBpm } from "./track";
import { setState } from "@data/stores/project";
import { synchronizeTone } from "./state";

export const setBpm = (bpm: number) => {
    setState((draftState) => {
        changeTracksBpm(draftState.tracks, draftState.bpm, bpm);
        draftState.bpm = bpm;
        synchronizeTone(draftState);
    }, "Change BPM");
};
