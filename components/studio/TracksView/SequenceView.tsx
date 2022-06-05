import React, { useEffect, useRef, useState } from "react";

import {
    selectProjectLength,
    selectSetSelectedTrackIndex,
    selectTracks,
    useStore,
} from "@Data/Store";
import { Box } from "@chakra-ui/react";
import { Track } from "@Interfaces/Track";
import PartView from "./PartView";
import { GetPixelsPerSecond } from "@Utility/TimeUtils";
import { ClearSelectedPartsIndices } from "@Utility/PartUtils";

interface SequenceViewProps {
    basePixelsPerSecond: number;
    snapWidth: number;
}

const SequenceView = (props: SequenceViewProps) => {
    const tracks = useStore(selectTracks);
    const setSelectedTrackIndex = useStore(selectSetSelectedTrackIndex);
    const projectLength = useStore(selectProjectLength);

    return (
        <Box position="absolute" top={0} left={0}>
            {tracks.map((track: Track, trackIndex: number) => (
                <Box
                    key={trackIndex}
                    height="90px"
                    width={projectLength * props.basePixelsPerSecond}
                    position="relative"
                    padding="0px"
                    onMouseDown={(event) => {
                        if (event.currentTarget === event.target) {
                            ClearSelectedPartsIndices();
                            setSelectedTrackIndex(trackIndex);
                        }
                    }}
                    borderBottom="1px solid gray"
                >
                    {track.parts.map((part, partIndex) => (
                        <PartView
                            key={part.id}
                            part={part}
                            subSelectionIndex={{
                                containerIndex: trackIndex,
                                selectionIndex: partIndex,
                            }}
                            pixelsPerSecond={GetPixelsPerSecond(
                                props.basePixelsPerSecond
                            )}
                            snapWidth={props.snapWidth}
                        />
                    ))}
                </Box>
            ))}
        </Box>
    );
};

export default SequenceView;
