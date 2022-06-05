import { Box } from "@chakra-ui/react";
import React, { useEffect, useRef } from "react";

import { Note } from "@Interfaces/Note";
import { Part } from "@Interfaces/Part";
import { MidiNote } from "./MidiNote";
import { IsSelected } from "@Utility/SelectionUtils";

interface PianoRollProps {
    partIndex: number;
    part: Part;
    rowHeight: number;
    cellWidth: number;
    gridHeight: number;
    isSnappingOn: boolean;
    snapWidth: number;
    pixelsPerSecond: number;
}

const PianoRollPartView = (props: PianoRollProps) => {
    // useEffect(() => {
    //     console.log("start2", props.part);
    // }, [props.part]);

    return (
        // <Box key={partIndex} >
        <Box
            key={props.partIndex}
            position="absolute"
            left={`${props.part.startTime * props.pixelsPerSecond}px`}
        >
            <Box
                borderWidth={1}
                zIndex={9998}
                position="absolute"
                pointerEvents="none"
                width={
                    (props.part.stopTime - props.part.startTime) *
                        props.pixelsPerSecond +
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
                    snapWidth={props.snapWidth}
                    pixelsPerSecond={props.pixelsPerSecond}
                />
            ))}
        </Box>
    );
};

export default PianoRollPartView;
