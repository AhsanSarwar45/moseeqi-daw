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
    COPY_TRACKS: { key: "ctrl+c", scope: Panel.TracksInfoView },
    COPY_PARTS: { key: "ctrl+c", scope: Panel.SequenceView },
    COPY_NOTES: { key: "ctrl+c", scope: Panel.PianoRoll },
    PASTE_TRACKS: { key: "ctrl+v", scope: Panel.TracksInfoView },
    PASTE_PARTS: { key: "ctrl+v", scope: Panel.SequenceView },
    PASTE_NOTES: { key: "ctrl+v", scope: Panel.PianoRoll },
    CUT_TRACKS: { key: "ctrl+x", scope: Panel.TracksInfoView },
    CUT_PARTS: { key: "ctrl+x", scope: Panel.SequenceView },
    CUT_NOTES: { key: "ctrl+x", scope: Panel.PianoRoll },
    SELECT_ALL_TRACKS: { key: "ctrl+a", scope: Panel.TracksInfoView },
    SELECT_ALL_PARTS: { key: "ctrl+a", scope: Panel.SequenceView },
    SELECT_ALL_NOTES: { key: "ctrl+a", scope: Panel.PianoRoll },
};
