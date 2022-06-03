import { Box } from "@chakra-ui/react";
import React from "react";

import {
    selectSetSelectedPartsIndices,
    selectSetSelectedPartsStartTime,
    selectSetSelectedPartsStopTime,
    useTracksStore,
} from "@Data/TracksStore";
import { Part } from "@Interfaces/Part";
import TimeDraggable from "@Components/TimeDraggable";
import {
    GetPartSelectionStartIndex,
    GetPartSelectionStartOffsets,
    GetPartSelectionStopOffsets,
} from "@Utility/SelectionUtils";
import { isHotkeyPressed } from "react-hotkeys-hook";

interface PartViewProps {
    part: Part;
    partIndex: number;
    trackIndex: number;
    pixelsPerSecond: number;
    snapWidth: number;
    isSelected: boolean;
}

const PartView = (props: PartViewProps) => {
    const setSelectedPartsStopTime = useTracksStore(
        selectSetSelectedPartsStopTime
    );
    const setSelectedPartsStartTime = useTracksStore(
        selectSetSelectedPartsStartTime
    );
    const setSelectedPartsIndices = useTracksStore(
        selectSetSelectedPartsIndices
    );

    return (
        <TimeDraggable
            startTime={props.part.startTime}
            duration={props.part.duration}
            snapWidth={props.snapWidth}
            isSelected={props.isSelected}
            pixelsPerSecond={props.pixelsPerSecond}
            setStartTime={setSelectedPartsStartTime}
            setStopTime={setSelectedPartsStopTime}
            getSelectionStartOffsets={(selection) =>
                GetPartSelectionStartOffsets(props.part, selection)
            }
            getSelectionStopOffsets={(selection) =>
                GetPartSelectionStopOffsets(props.part, selection)
            }
            getSelectionStartIndex={(selection) =>
                GetPartSelectionStartIndex(selection)
            }
            setSelectedIndices={() =>
                setSelectedPartsIndices(
                    props.trackIndex,
                    props.partIndex,
                    isHotkeyPressed("shift")
                )
            }
        >
            {props.part.notes.map((note, index) => (
                <Box
                    zIndex={200}
                    key={note.id}
                    bgColor="secondary.500"
                    position="absolute"
                    top={`${note.keyIndex + 1}px`}
                    left={`${note.startTime * props.pixelsPerSecond}px`}
                    width={`${note.duration * props.pixelsPerSecond}px`}
                    height="1px"
                />
            ))}
        </TimeDraggable>
    );
};

export default PartView;
