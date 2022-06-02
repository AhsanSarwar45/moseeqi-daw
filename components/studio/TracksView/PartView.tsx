import { Box } from "@chakra-ui/react";
import React, { memo, useContext, useEffect, useRef, useState } from "react";
import { Rnd } from "react-rnd";
import useMouse from "@react-hook/mouse-position";

import {
    selectMoveSelectedParts,
    selectSetSelectedPartsIndices,
    selectSetSelectedPartsStartTime,
    selectSetSelectedPartsStopTime,
    useTracksStore,
} from "@Data/TracksStore";
import { Part } from "@Interfaces/Part";
import { PartSelectionIndex } from "@Interfaces/Selection";
import { Snap } from "@Utility/SnapUtils";
import Draggable from "@Components/Draggable";
import TimeDraggable from "@Components/Draggable";
import {
    GetPartSelectionStartIndex,
    GetPartSelectionStartOffsets,
    GetPartSelectionStopOffsets,
} from "@Utility/SelectionUtils";

interface PartViewProps {
    part: Part;
    partIndex: number;
    trackIndex: number;
    pixelsPerSecond: number;
    snapWidth: number;
    isShiftHeld: boolean;
    isSelected: boolean;
    // onDragStop: () => void;
    // onResizeStop: () => void;
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
                    props.isShiftHeld
                )
            }
        >
            {props.part.notes.map((note, index) => (
                <Box
                    zIndex={900}
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
        // {/* // </Rnd> */}
    );
};

export default PartView;
