import {
    selectProjectLength,
    selectTrackCount,
    selectTracks,
    useStore,
} from "@data/stores/project";
import { Box } from "@chakra-ui/react";
import { Track } from "@Interfaces/Track";
import Sequence from "./Sequence";
import { getTrackEntries, getTrackIds } from "@logic/track";

interface SequenceViewProps {
    basePixelsPerSecond: number;
    sequenceHeight: number;
    snapWidth: number;
}

const SequenceView = (props: SequenceViewProps) => {
    const trackCount = useStore(selectTrackCount);
    const trackMap = useStore((state) => state.tracks);

    return (
        <Box position="absolute" top={0} left={0}>
            {Array.from(trackMap).map(([trackId, track], index) => {
                // console.log(index, trackCount, 4);
                return (
                    <Sequence
                        key={trackId}
                        trackId={trackId}
                        track={track}
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
