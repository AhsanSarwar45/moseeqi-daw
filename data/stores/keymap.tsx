import { defaultKeymap } from "@data/defaults";
import { Panel } from "@interfaces/enums/panel";
import { KeyAction, Keymap } from "@interfaces/keymap";
import { create } from "zustand";

interface KeymapStoreState {
    keymap: Keymap;
    setKeymap: (action: KeyAction, key: string) => void;
}

export const useKeymapStore = create<KeymapStoreState>()((set) => ({
    keymap: defaultKeymap,
    setKeymap: (action: KeyAction, key: string) => {
        set((prev) => {
            return {
                keymap: {
                    ...prev.keymap,
                    [action]: {
                        ...prev.keymap[action],
                        key,
                    },
                },
            };
        });
    },
}));

export const selectKeymap = (state: KeymapStoreState) => state.keymap;
export const selectSetKeymap = (state: KeymapStoreState) => state.setKeymap;
