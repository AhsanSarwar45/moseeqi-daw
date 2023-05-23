import { Box } from "@chakra-ui/react";
import { selectProjectLength, useStore } from "@Data/Store";
import { PartMap } from "@Types/Types";
import { ClearSelectedPartsIndices } from "@Utility/PartUtils";
import { GetPixelsPerSecond } from "@Utility/TimeUtils";
import React from "react";
import PartView from "./PartView";

interface SequenceProps {
    trackId: number;
    trackIndex: number;
    basePixelsPerSecond: number;
    snapWidth: number;
    height: number;
}

const Sequence = (props: SequenceProps) => {
    const parts = useStore(
        (state) => state.tracks.get(props.trackId)?.parts as PartMap
    );
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
            //         ClearSelectedPartsIndices();
            //         SetSelectedTrackIndex(props.trackIndex);
            //     }
            // }}
            // borderBottomWidth={1}
            // borderColor={"gray.500"}
            // boxSizing="border-box"
        >
            {Array.from(parts.entries()).map((partRecord) => (
                <PartView
                    key={partRecord[0]}
                    partRecord={partRecord}
                    pixelsPerSecond={GetPixelsPerSecond(
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
