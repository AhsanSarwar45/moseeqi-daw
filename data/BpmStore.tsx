import create from "zustand";
import * as Tone from "tone";

import { defaultBPM } from "./Defaults";
import { initialSecondsPerDivision } from "./Constants";
import { BpmToBps } from "@Utility/TimeUtils";
import { useTracksStore } from "./TracksStore";
import { ChangeTracksBpm } from "@Utility/TrackUtils";

interface BpmStoreState {
    bpm: number;
    setBpm: (bpm: number) => void;
}

export const useBpmStore = create<BpmStoreState>()((set) => ({
    bpm: defaultBPM,
    setBpm: (bpm: number) => {
        Tone.Transport.bpm.value = bpm;

        set((prev) => {
            const tracks = useTracksStore.getState().tracks;
            ChangeTracksBpm(tracks, prev.bpm, bpm);
            useTracksStore.setState({
                tracks: tracks,
            });
            return {
                bpm: bpm,
            };
        });
    },
}));

export const selectSetBpm = (state: BpmStoreState) => state.setBpm;
export const selectBpm = (state: BpmStoreState) => state.bpm;
export const selectBps = (state: BpmStoreState) => state.bpm / 60;
export const selectCurrentSecondPerDivision = (state: BpmStoreState) =>
    initialSecondsPerDivision / BpmToBps(state.bpm);
