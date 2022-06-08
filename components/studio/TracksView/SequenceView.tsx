import {
    selectProjectLength,
    selectTrackCount,
    selectTracks,
    useStore,
} from "@Data/Store";
import { Box } from "@chakra-ui/react";
import { Track } from "@Interfaces/Track";
import Sequence from "./Sequence";

interface SequenceViewProps {
    basePixelsPerSecond: number;
    snapWidth: number;
}

const SequenceView = (props: SequenceViewProps) => {
    const trackCount = useStore(selectTrackCount);

    return (
        <Box position="absolute" top={0} left={0}>
            {[...Array(trackCount)].map((_, index) => {
                // console.log(index, trackCount, 4);
                return (
                    <Sequence
                        key={index}
                        trackIndex={index}
                        basePixelsPerSecond={props.basePixelsPerSecond}
                        snapWidth={props.snapWidth}
                    />
                );
            })}
        </Box>
    );
};

export default SequenceView;
