import { Box } from "@chakra-ui/react";
import React, { forwardRef } from "react";

import { Part } from "@Interfaces/Part";
import TimeDraggable from "@Components/TimeDraggable";
import { isHotkeyPressed } from "react-hotkeys-hook";
import { SelectionType, SubSelectionIndex } from "@Interfaces/Selection";
import { IsSelected } from "@Utility/SelectionUtils";
import { selectSelectedPartIndices, useStore } from "@Data/Store";
import { IsNoteDisabled } from "@Utility/NoteUtils";

interface PartViewProps {
    part: Part;
    subSelectionIndex: SubSelectionIndex;
    pixelsPerSecond: number;
    snapWidth: number;
}

const PartView = (props: PartViewProps) => {
    const selectedPartIndices = useStore(selectSelectedPartIndices);

    return (
        <TimeDraggable
            timeBlock={props.part}
            selectionType={SelectionType.Part}
            snapWidth={props.snapWidth}
            pixelsPerSecond={props.pixelsPerSecond}
            subSelectionIndex={props.subSelectionIndex}
            isSelected={IsSelected(props.subSelectionIndex, SelectionType.Part)}
            borderColor="white"
            selectedBorderColor="secondary.500"
            bgColor="rgb(0,0,0,0.4)"
            height="full"
            getSelectionRowOffsets={() => []}
            getSelectionRowStartIndex={() => 0}
            setRow={(row, selectionRowOffsets) => {}}
        >
            {props.part.notes.map((note, index) => (
                <Box
                    zIndex={200}
                    key={note.id}
                    bgColor={
                        IsNoteDisabled(note, props.part)
                            ? "gray.500"
                            : "secondary.500"
                    }
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
