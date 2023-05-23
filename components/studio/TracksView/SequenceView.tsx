import {
    selectProjectLength,
    selectTrackCount,
    selectTracks,
    useStore,
} from "@Data/Store";
import { Box } from "@chakra-ui/react";
import { Track } from "@Interfaces/Track";
import Sequence from "./Sequence";
import { GetTrackEntries, GetTrackIds } from "@Utility/TrackUtils";

interface SequenceViewProps {
    basePixelsPerSecond: number;
    sequenceHeight: number;
    snapWidth: number;
}

const SequenceView = (props: SequenceViewProps) => {
    const trackCount = useStore(selectTrackCount);

    return (
        <Box position="absolute" top={0} left={0}>
            {GetTrackIds().map((trackId, index) => {
                // console.log(index, trackCount, 4);
                return (
                    <Sequence
                        key={trackId}
                        trackId={trackId}
                        trackIndex={index}
                        basePixelsPerSecond={props.basePixelsPerSecond}
                        snapWidth={props.snapWidth}
                        height={props.sequenceHeight}
                    />
                );
            })}
        </Box>
    );
};

export default SequenceView;
