import { Panel } from "@Interfaces/enums/Panel";
import { KeyAction, Keymap } from "@Interfaces/Keymap";
import create from "zustand";
import { defaultKeymap } from "./Defaults";

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
