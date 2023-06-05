import { Box } from "@chakra-ui/react";
import React, { forwardRef } from "react";

import { Part } from "@interfaces/part";
import TimeDraggable from "@components/time-draggable";
import { isHotkeyPressed } from "react-hotkeys-hook";
import { SelectionType } from "@interfaces/selection";
import { checkIsTimeBlockSelected } from "@logic/selection";
import { selectSelectedPartsIds, useStore } from "@data/stores/project";
import { IsNoteDisabled } from "@logic/note";
import { PartRecord } from "@custom-types/types";

interface PartViewProps {
    partRecord: PartRecord;
    pixelsPerSecond: number;
    snapWidth: number;
    height: number;
}

const PartView = (props: PartViewProps) => {
    const selectedParts = useStore(selectSelectedPartsIds);

    const [partId, part] = props.partRecord;

    return (
        <TimeDraggable
            timeBlockRecord={props.partRecord}
            selectionType={SelectionType.Part}
            snapWidth={props.snapWidth}
            pixelsPerSecond={props.pixelsPerSecond}
            isSelected={checkIsTimeBlockSelected(
                props.partRecord,
                selectedParts
            )}
            borderColor="white"
            selectedBorderColor="secondary.500"
            bgColor="rgb(0,0,0,0.4)"
            height={`${props.height}px`}
        >
            {Array.from(part.notes.entries()).map(([noteId, note]) => (
                <Box
                    zIndex={200}
                    key={noteId}
                    bgColor={
                        IsNoteDisabled(note, part)
                            ? "gray.500"
                            : "secondary.500"
                    }
                    position="absolute"
                    top={`${note.rowIndex + 1}px`}
                    left={`${note.startTime * props.pixelsPerSecond}px`}
                    width={`${note.duration * props.pixelsPerSecond}px`}
                    height="1px"
                />
            ))}
        </TimeDraggable>
    );
};

export default PartView;
