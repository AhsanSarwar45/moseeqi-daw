import { Box } from "@chakra-ui/react";
import { selectProjectLength, useStore } from "@data/stores/project";
import { PartMap } from "@Types/Types";
import { clearSelectedPartsIndices } from "@logic/part";
import { getPixelsPerSecond } from "@logic/time";
import React from "react";
import PartView from "./PartView";
import { Track } from "@Interfaces/Track";

interface SequenceProps {
    trackId: number;
    track: Track;
    trackIndex: number;
    basePixelsPerSecond: number;
    snapWidth: number;
    height: number;
}

const Sequence = (props: SequenceProps) => {
    const projectLength = useStore(selectProjectLength);

    return (
        <Box
            top={props.height * props.trackIndex}
            key={props.trackId}
            // height={props.height}
            // width={projectLength * props.basePixelsPerSecond}
            position="relative"
            padding="0px"
            // onMouseDown={(event) => {
            //     if (event.currentTarget === event.target) {
            //         clearSelectedPartsIndices();
            //         setSelectedTrackIndex(props.trackIndex);
            //     }
            // }}
            // borderBottomWidth={1}
            // borderColor={"gray.500"}
            // boxSizing="border-box"
        >
            {Array.from(props.track.parts.entries()).map((partRecord) => (
                <PartView
                    key={partRecord[0]}
                    partRecord={partRecord}
                    pixelsPerSecond={getPixelsPerSecond(
                        props.basePixelsPerSecond
                    )}
                    snapWidth={props.snapWidth}
                    height={props.height}
                />
            ))}
        </Box>
    );
};

export default Sequence;
