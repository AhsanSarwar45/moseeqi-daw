import { Box } from "@chakra-ui/react";
import { selectProjectLength, useProjectStore } from "@Data/ProjectStore";
import {
    selectSelectedTrack,
    selectTracks,
    useTracksStore,
} from "@Data/TracksStore";
import { GetPixelsPerSecond } from "@Utility/TimeUtils";
import React, { useRef } from "react";
import PianoRollPartView from "./PianoRollPartView";

interface GridViewProps {
    basePixelsPerSecond: number;
    columnWidth: number;
    gridHeight: number;
    gridCellHeight: number;
    isSnappingOn: boolean;
}

const GridView = (props: GridViewProps) => {
    const selectedTrack = useTracksStore(selectSelectedTrack);
    const tracks = useTracksStore(selectTracks);

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
                    currentPixelsPerSecond={GetPixelsPerSecond(
                        props.basePixelsPerSecond
                    )}
                    isSnappingOn={props.isSnappingOn}
                />
            ))}
        </>
    );
};

export default GridView;
