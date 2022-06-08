import { Box } from "@chakra-ui/react";
import { selectProjectLength, useStore } from "@Data/Store";
import { ClearSelectedPartsIndices } from "@Utility/PartUtils";
import { GetPixelsPerSecond } from "@Utility/TimeUtils";
import { SetSelectedTrackIndex } from "@Utility/TrackUtils";
import React from "react";
import PartView from "./PartView";

interface SequenceProps {
    trackIndex: number;
    basePixelsPerSecond: number;
    snapWidth: number;
}

const Sequence = (props: SequenceProps) => {
    const parts = useStore((state) => state.tracks[props.trackIndex].parts);
    const projectLength = useStore(selectProjectLength);

    return (
        <Box
            key={props.trackIndex}
            height="90px"
            width={projectLength * props.basePixelsPerSecond}
            position="relative"
            padding="0px"
            onMouseDown={(event) => {
                if (event.currentTarget === event.target) {
                    ClearSelectedPartsIndices();
                    SetSelectedTrackIndex(props.trackIndex);
                }
            }}
            borderBottom="1px solid gray"
        >
            {parts.map((part, partIndex) => (
                <PartView
                    key={part.id}
                    part={part}
                    subSelectionIndex={{
                        containerIndex: props.trackIndex,
                        selectionIndex: partIndex,
                    }}
                    pixelsPerSecond={GetPixelsPerSecond(
                        props.basePixelsPerSecond
                    )}
                    snapWidth={props.snapWidth}
                />
            ))}
        </Box>
    );
};

export default Sequence;
