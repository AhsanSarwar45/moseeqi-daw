import useKeyMap from "@Hooks/useKeyMap";
import { Undo, Redo } from "@Utility/HistoryUtils";
import { DeleteSelectedNotes } from "@Utility/NoteUtils";
import { DeleteSelectedParts } from "@Utility/PartUtils";
import { TogglePlayback } from "@Utility/PlaybackUtils";
import { DeleteSelectedTrack } from "@Utility/TrackUtils";
import React from "react";

const Hotkeys = () => {
    useKeyMap("TOGGLE_PLAYBACK", TogglePlayback);

    useKeyMap("DELETE_TRACKS", DeleteSelectedTrack);
    useKeyMap("DELETE_PARTS", DeleteSelectedParts);
    useKeyMap("DELETE_NOTES", DeleteSelectedNotes);

    useKeyMap("UNDO", Undo);
    useKeyMap("REDO", Redo);

    return <></>;
};

export default Hotkeys;
