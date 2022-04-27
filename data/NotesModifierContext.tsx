import React from "react";

export const NotesModifierContext = React.createContext({
    onAddNote: (column: number, row: number, divisor: number) => { },
    onMoveNote: (partIndex: number, noteIndex: number, column: number, row: number) => { },
    onResizeNote: (partIndex: number, noteIndex: number, duration: number) => { },
    onRemoveNote: (partIndex: number, noteIndex: number) => { },
    onClearNotes: () => { }
});

