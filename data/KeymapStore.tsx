import create from "zustand";

interface Keymap {
    TOGGLE_PLAYBACK: string;
    DELETE_TRACKS: string;
}

interface KeymapStoreState {
    keymap: Keymap;
    setKeymap: (action: string, key: string) => void;
}

export const useKeymapStore = create<KeymapStoreState>()((set) => ({
    keymap: {
        TOGGLE_PLAYBACK: "space",
        DELETE_TRACKS: "delete",
    },
    setKeymap: (action: string, key: string) => {
        set((prev) => {
            return {
                keymap: { ...prev.keymap, [action]: key },
            };
        });
    },
}));

export const selectKeymap = (state: KeymapStoreState) => state.keymap;
export const selectSetKeymap = (state: KeymapStoreState) => state.setKeymap;
