import useKeyMap from "@hooks/use-keymap";
import { undo, redo } from "@logic/history";
import { deleteSelectedNotes } from "@logic/note";
import { deleteSelectedParts } from "@logic/part";
import { togglePlayback } from "@logic/playback";
import { deleteSelectedTracks } from "@logic/track";
import React from "react";

const Hotkeys = () => {
    useKeyMap("TOGGLE_PLAYBACK", togglePlayback);

    useKeyMap("DELETE_TRACKS", deleteSelectedTracks);
    useKeyMap("DELETE_PARTS", deleteSelectedParts);
    useKeyMap("DELETE_NOTES", deleteSelectedNotes);

    useKeyMap("UNDO", undo);
    useKeyMap("REDO", redo);

    return <></>;
};

export default Hotkeys;
