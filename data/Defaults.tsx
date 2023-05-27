import { Panel } from "@interfaces/enums/panel";
import { Keymap } from "@interfaces/keymap";

export const defaultBPM = 120;
export const defaultInstrumentIndex = 0;
export const defaultProjectLength = 180;
export const defaultProjectName = "Untitled";
export const defaultMinPartDuration = 0.1;

export const defaultKeymap: Keymap = {
    TOGGLE_PLAYBACK: { key: "space", scope: Panel.None },
    DELETE_TRACKS: { key: "delete", scope: Panel.TracksInfoView },
    DELETE_PARTS: { key: "delete", scope: Panel.SequenceView },
    DELETE_NOTES: { key: "delete", scope: Panel.PianoRoll },
    UNDO: { key: "ctrl+z", scope: Panel.None },
    REDO: { key: "ctrl+shift+z", scope: Panel.None },
};

// export const defaultKeyMaps: Array<KeyMap> = [
//     { action: "toggle_playback", key: "space", scope: Panel.None },
//     { action: "delete_tracks", key: "delete", scope: Panel.TracksInfoView },
//     { action: "delete_parts", key: "delete", scope: Panel.SequenceView },
// ];
