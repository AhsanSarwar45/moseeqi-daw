import React from "react";

export const NotesModifierContext = React.createContext({
    onAddNote: (column: number, row: number, divisor: number) => {},
    onMoveNote: (
        partIndex: number,
        noteIndex: number,
        startTime: number,
        stopTime: number,
        row: number
    ) => {},
    onRemoveNote: (partIndex: number, noteIndex: number) => {},
    onClearNotes: () => {},
});
