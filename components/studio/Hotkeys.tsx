import useKeyMap from "@hooks/use-keymap";
import { undo, redo } from "@logic/history";
import { deleteSelectedNotes } from "@logic/note";
import { deleteSelectedParts } from "@logic/part";
import { togglePlayback } from "@logic/playback";
import {
    copySelectedTracks,
    deleteSelectedTracks,
    pasteSelectedTracks,
} from "@logic/track";
import React from "react";

const Hotkeys = () => {
    useKeyMap("TOGGLE_PLAYBACK", togglePlayback);

    useKeyMap("DELETE_TRACKS", deleteSelectedTracks);
    useKeyMap("DELETE_PARTS", deleteSelectedParts);
    useKeyMap("DELETE_NOTES", deleteSelectedNotes);

    useKeyMap("UNDO", undo);
    useKeyMap("REDO", redo);

    useKeyMap("COPY_TRACKS", copySelectedTracks);
    useKeyMap("PASTE_TRACKS", pasteSelectedTracks);

    return <></>;
};

export default Hotkeys;
