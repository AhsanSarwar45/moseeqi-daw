import { Box } from "@chakra-ui/react";
import React, { useEffect, useRef } from "react";

import { Note } from "@Interfaces/Note";
import { Part } from "@Interfaces/Part";
import { MidiNote } from "./MidiNote";
import { IsIdSelected } from "@Utility/SelectionUtils";
import { PartRecord } from "@Types/Types";

interface PianoRollProps {
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
        <Box
            position="absolute"
            left={`${props.part.startTime * props.pixelsPerSecond}px`}
        >
            <Box
                borderWidth={1}
                zIndex={9998}
                position="absolute"
                pointerEvents="none"
                width={props.part.duration * props.pixelsPerSecond + 1}
                height={props.gridHeight}
                bgColor="rgba(255,0,0,0.05)"
            />

            {Array.from(props.part.notes.entries()).map((noteRecord) => (
                <MidiNote
                    key={noteRecord[0]}
                    noteRecord={noteRecord}
                    part={props.part}
                    isSnappingOn={props.isSnappingOn}
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
