import { Box } from "@chakra-ui/react";
import React from "react";

import { Note } from "@Interfaces/Note";
import { Part } from "@Interfaces/Part";
import { MidiNote } from "./MidiNote";

interface PianoRollProps {
    partIndex: number;
    part: Part;
    rowHeight: number;
    cellWidth: number;
    gridHeight: number;
    isSnappingOn: boolean;
    pixelsPerSecond: number;
    currentPixelsPerSecond: number;
    onFilledNoteClick: (key: string, duration: number) => void;
}

const PianoRollPartView = (props: PianoRollProps) => {
    return (
        // <Box key={partIndex} >
        <Box
            key={props.partIndex}
            position="absolute"
            left={props.part.startTime * props.currentPixelsPerSecond}
        >
            <Box
                borderWidth={1}
                zIndex={9998}
                position="absolute"
                pointerEvents="none"
                width={
                    (props.part.stopTime - props.part.startTime) *
                        props.currentPixelsPerSecond +
                    1
                }
                height={props.gridHeight}
                bgColor="rgba(255,0,0,0.05)"
            />

            {props.part.notes.map((note: Note, noteIndex: number) => (
                <MidiNote
                    key={note.id}
                    note={note}
                    noteIndex={noteIndex}
                    part={props.part}
                    isSnappingOn={props.isSnappingOn}
                    partIndex={props.partIndex}
                    cellHeight={props.rowHeight}
                    cellWidth={props.cellWidth}
                    onClick={props.onFilledNoteClick}
                    pixelsPerSecond={props.pixelsPerSecond}
                    currentPixelsPerSecond={props.currentPixelsPerSecond}
                />
            ))}
        </Box>
    );
};

export default PianoRollPartView;
