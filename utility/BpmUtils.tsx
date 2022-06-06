import * as Tone from "tone";

import { useStore } from "@Data/Store";
import { ChangeTracksBpm, GetTracksCopy } from "./TrackUtils";
import { SetStoreState } from "@Data/SetStoreState";

export const SetBpm = (bpm: number) => {
    const tracks = GetTracksCopy();
    const prevBpm = useStore.getState().bpm;

    Tone.Transport.bpm.value = bpm;

    ChangeTracksBpm(tracks, prevBpm, bpm);
    SetStoreState(
        {
            tracks: tracks,
            bpm: bpm,
        },
        "Change BPM"
    );
};
