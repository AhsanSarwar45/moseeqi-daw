import { PlaybackState } from "@Interfaces/enums/PlaybackState";
import create from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

interface PlaybackStoreState {
    playbackState: PlaybackState;
    seek: number;
}

export const usePlaybackStore = create<PlaybackStoreState>()(
    subscribeWithSelector((set) => ({
        playbackState: PlaybackState.Stopped,
        seek: 0,
    }))
);

export const selectSeek = (state: PlaybackStoreState) => state.seek;
export const selectPlaybackState = (state: PlaybackStoreState) =>
    state.playbackState;
