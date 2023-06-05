import { Box } from "@chakra-ui/react";
import { selectProjectLength, useStore } from "@data/stores/project";
import { PartMap } from "@custom-types/types";
import { clearSelectedPartsIndices } from "@logic/part";
import { getPixelsPerSecond } from "@logic/time";
import React from "react";
import PartView from "./part-view";
import { Track } from "@interfaces/track";

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
            // bgColor="red"
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
