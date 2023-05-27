import { Hotkey } from "./hotkey";

export type KeyAction =
    | "TOGGLE_PLAYBACK"
    | "DELETE_TRACKS"
    | "DELETE_PARTS"
    | "DELETE_NOTES"
    | "UNDO"
    | "REDO";

export interface Keymap {
    TOGGLE_PLAYBACK: Hotkey;
    DELETE_TRACKS: Hotkey;
    DELETE_PARTS: Hotkey;
    DELETE_NOTES: Hotkey;
    UNDO: Hotkey;
    REDO: Hotkey;
}
