import { Hotkey } from "./Hotkey";

export type KeyAction =
    | "TOGGLE_PLAYBACK"
    | "DELETE_TRACKS"
    | "DELETE_PARTS"
    | "DELETE_NOTES";

export interface Keymap {
    TOGGLE_PLAYBACK: Hotkey;
    DELETE_TRACKS: Hotkey;
    DELETE_PARTS: Hotkey;
    DELETE_NOTES: Hotkey;
}
