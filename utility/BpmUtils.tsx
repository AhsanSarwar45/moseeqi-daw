import * as Tone from "tone";

import { useStore } from "@Data/Store";
import { ChangeTracksBpm, GetTracksCopy } from "./TrackUtils";
import { SetState } from "@Data/SetStoreState";

export const SetBpm = (bpm: number) => {
    const tracks = GetTracksCopy();
    const prevBpm = useStore.getState().bpm;

    Tone.Transport.bpm.value = bpm;

    ChangeTracksBpm(tracks, prevBpm, bpm);
    SetState((draftState) => {
        draftState.tracks = tracks;
        draftState.bpm = bpm;
    }, "Change BPM");
};
