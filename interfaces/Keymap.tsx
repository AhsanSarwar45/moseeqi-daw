import { Hotkey } from "./hotkey";

export type KeyAction =
    | "TOGGLE_PLAYBACK"
    | "DELETE_TRACKS"
    | "DELETE_PARTS"
    | "DELETE_NOTES"
    | "UNDO"
    | "REDO"
    | "COPY_TRACKS"
    | "COPY_PARTS"
    | "COPY_NOTES"
    | "PASTE_TRACKS"
    | "PASTE_PARTS"
    | "PASTE_NOTES"
    | "CUT_TRACKS"
    | "CUT_PARTS"
    | "CUT_NOTES"
    | "SELECT_ALL_TRACKS"
    | "SELECT_ALL_PARTS"
    | "SELECT_ALL_NOTES";

export interface Keymap {
    TOGGLE_PLAYBACK: Hotkey;
    DELETE_TRACKS: Hotkey;
    DELETE_PARTS: Hotkey;
    DELETE_NOTES: Hotkey;
    UNDO: Hotkey;
    REDO: Hotkey;
    COPY_TRACKS: Hotkey;
    COPY_PARTS: Hotkey;
    COPY_NOTES: Hotkey;
    PASTE_TRACKS: Hotkey;
    PASTE_PARTS: Hotkey;
    PASTE_NOTES: Hotkey;
    CUT_TRACKS: Hotkey;
    CUT_PARTS: Hotkey;
    CUT_NOTES: Hotkey;
    SELECT_ALL_TRACKS: Hotkey;
    SELECT_ALL_PARTS: Hotkey;
    SELECT_ALL_NOTES: Hotkey;
}
