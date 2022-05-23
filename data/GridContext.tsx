import { Part } from "@Interfaces/Part";
import { PlaybackState } from "@Types/Types";
import { createContext } from "react";

export const GridContext = createContext({
    stickyHeight: 0,
    stickyWidth: 0,
    columnWidth: 0,
    gridWidth: 0,
    gridHeight: 0,
    rowHeight: 0,
    isSnappingOn: true,
    playbackState: 0 as PlaybackState,
    seek: 0,
    setSeek: (seek: number) => {},
    onKeyDown: (label: string) => {},
    onKeyUp: (label: string) => {},
    onFilledNoteClick: (key: string, duration: number) => {},
    parts: [] as Array<Part>,
    currentPixelsPerSecond: 0,
    pixelsPerSecond: 0,
});

GridContext.displayName = "GridContext";
