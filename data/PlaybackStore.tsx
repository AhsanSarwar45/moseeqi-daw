import create from "zustand";

import { PlaybackState } from "@Interfaces/enums/PlaybackState";
import { IsAudioContextStarted, StartAudioContext } from "./AudioContext";
import {
    PauseTransport,
    StartTransport,
    StopTransport,
} from "@Utility/TransportUtils";

interface PlaybackStoreState {
    playbackState: PlaybackState;
    setPlaybackState: (playbackState: PlaybackState) => void;
    togglePlayback: () => void;
}

export const usePlaybackStore = create<PlaybackStoreState>()((set) => ({
    playbackState: PlaybackState.Stopped,
    setPlaybackState: (playbackState: PlaybackState) => {
        if (!IsAudioContextStarted()) StartAudioContext();
        set((prev) => ({
            playbackState: playbackState,
        }));
    },
    togglePlayback: () => {
        if (!IsAudioContextStarted()) StartAudioContext();
        set((prev) => {
            if (prev.playbackState === PlaybackState.Stopped) {
                return { playbackState: PlaybackState.Playing };
            } else if (prev.playbackState === PlaybackState.Playing) {
                return { playbackState: PlaybackState.Paused };
            } else if (prev.playbackState === PlaybackState.Paused) {
                return { playbackState: PlaybackState.Playing };
            } else return prev;
        });
    },
}));

const _ = usePlaybackStore.subscribe((state) => {
    if (state.playbackState === PlaybackState.Stopped) {
        StopTransport();
    } else if (state.playbackState === PlaybackState.Playing) {
        StartTransport();
    } else if (state.playbackState === PlaybackState.Paused) {
        PauseTransport();
    }
});

export const selectPlaybackState = (state: PlaybackStoreState) =>
    state.playbackState;
