import { Box } from "@chakra-ui/react";
import { selectSelectedTrack, selectTracks, useStore } from "@Data/Store";
import { GetPixelsPerSecond } from "@Utility/TimeUtils";
import React, { useEffect, useRef } from "react";
import PianoRollPartView from "./PianoRollPartView";

interface GridViewProps {
    basePixelsPerSecond: number;
    columnWidth: number;
    gridHeight: number;
    gridCellHeight: number;
    isSnappingOn: boolean;
    snapWidth: number;
}

const GridView = (props: GridViewProps) => {
    const selectedTrack = useStore(selectSelectedTrack);
    const tracks = useStore(selectTracks);

    return (
        <>
            {selectedTrack.parts.map((part, partIndex) => (
                <PianoRollPartView
                    key={part.id}
                    part={part}
                    partIndex={partIndex}
                    rowHeight={props.gridCellHeight}
                    cellWidth={props.columnWidth}
                    gridHeight={props.gridHeight}
                    pixelsPerSecond={GetPixelsPerSecond(
                        props.basePixelsPerSecond
                    )}
                    snapWidth={props.snapWidth}
                    isSnappingOn={props.isSnappingOn}
                />
            ))}
        </>
    );
};

export default GridView;
