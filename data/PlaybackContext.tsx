import { PlaybackState } from "@Types/Types";
import React from "react";

export const PlaybackContext = React.createContext({
    playbackState: 0 as PlaybackState,
    bpm: 120
});