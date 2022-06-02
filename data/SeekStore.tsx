import create from "zustand";

import { IsAudioContextStarted, StartAudioContext } from "./AudioContext";

interface SeekStoreState {
    seek: number;
    setSeek: (seek: number) => void;
}

export const useSeekStore = create<SeekStoreState>()((set) => ({
    seek: 0,
    setSeek: (seek: number) => {
        if (!IsAudioContextStarted()) StartAudioContext();
        set((prev) => ({
            seek: seek,
        }));
    },
}));

export const selectSeek = (state: SeekStoreState) => state.seek;
