import React, { useEffect, useState } from "react";

import {
    selectClearSelectedPartsIndices,
    selectSelectedPartIndices,
    selectSetSelectedTrackIndex,
    selectTracks,
    useTracksStore,
} from "@Data/TracksStore";
import { Box } from "@chakra-ui/react";
import { Track } from "@Interfaces/Track";
import { selectProjectLength, useProjectStore } from "@Data/ProjectStore";
import PartView from "./PartView";
import { GetPixelsPerSecond } from "@Utility/TimeUtils";
import { IsPartSelected } from "@Utility/SelectionUtils";

interface SequenceViewProps {
    basePixelsPerSecond: number;
    snapWidth: number;
}

const SequenceView = (props: SequenceViewProps) => {
    const tracks = useTracksStore(selectTracks);
    const selectedPartIndices = useTracksStore(selectSelectedPartIndices);
    const setSelectedTrackIndex = useTracksStore(selectSetSelectedTrackIndex);
    const clearSelectedPartsIndices = useTracksStore(
        selectClearSelectedPartsIndices
    );

    const projectLength = useProjectStore(selectProjectLength);

    const [isShiftHeld, setIsShiftHeld] = useState(false);

    // const partContainerRef = React.useRef<HTMLDivElement>(null);
    // const [localTracks, setLocalTracks] = useState(tracks);

    const OnKeyDown = ({ key }: { key: string }) => {
        if (key === "Shift") {
            setIsShiftHeld(true);
        }
    };

    const OnKeyUp = ({ key }: { key: string }) => {
        if (key === "Shift") {
            setIsShiftHeld(false);
        }
    };

    useEffect(() => {
        window.addEventListener("keydown", OnKeyDown);
        window.addEventListener("keyup", OnKeyUp);
        return () => {
            window.removeEventListener("keydown", OnKeyDown);
            window.removeEventListener("keyup", OnKeyUp);
        };
    }, []);

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
                            clearSelectedPartsIndices;
                            setSelectedTrackIndex(trackIndex);
                        }
                    }}
                    borderBottom="1px solid gray"
                >
                    {track.parts.map((part, partIndex) => (
                        <PartView
                            key={part.id}
                            part={part}
                            trackIndex={trackIndex}
                            partIndex={partIndex}
                            pixelsPerSecond={GetPixelsPerSecond(
                                props.basePixelsPerSecond
                            )}
                            snapWidth={props.snapWidth}
                            isShiftHeld={isShiftHeld}
                            isSelected={IsPartSelected(
                                selectedPartIndices,
                                partIndex,
                                trackIndex
                            )}
                            // onDragStop={() => {
                            //     setTracks(localTracks);
                            // }}
                            // onResizeStop={() => {
                            //     setTracks(localTracks);
                            // }}
                        />
                    ))}
                </Box>
            ))}
        </Box>
    );
};

export default SequenceView;
