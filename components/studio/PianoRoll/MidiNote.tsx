import { Box } from "@chakra-ui/react";

import { useContext, useEffect, useRef, useState } from "react";
import { Rnd } from "react-rnd";

import {
    selectRemoveNoteFromSelectedTrack,
    selectSelectedNoteIndices,
    selectSelectedTrack,
    useTracksStore,
} from "@Data/TracksStore";
import { Note } from "@Interfaces/Note";
import { Part } from "@Interfaces/Part";
import { Snap } from "@Utility/SnapUtils";
import TimeDraggable from "@Components/TimeDraggable";
import { SelectionType, SubSelectionIndex } from "@Interfaces/Selection";
import {
    GetNoteSelectionRowOffsets,
    GetNoteSelectionRowStartIndex,
    SetNoteSelectionRow,
} from "@Utility/NoteUtils";
import { IsSelected } from "@Utility/SelectionUtils";

interface MidiNoteProps {
    note: Note;
    part: Part;
    partIndex: number;
    noteIndex: number;
    cellHeight: number;
    cellWidth: number;
    snapWidth: number;
    isSnappingOn: boolean;
    pixelsPerSecond: number;
}

export const MidiNote = (props: MidiNoteProps) => {
    const removeNoteFromSelectedTrack = useTracksStore(
        selectRemoveNoteFromSelectedTrack
    );
    const selectedTrack = useTracksStore(selectSelectedTrack);
    const selectedNoteIndices = useTracksStore(selectSelectedNoteIndices);

    const subSelectionIndex = {
        containerIndex: props.partIndex,
        selectionIndex: props.noteIndex,
    };

    return (
        // <></>
        <TimeDraggable
            timeContainer={props.note}
            selectionType={SelectionType.Note}
            snapWidth={props.snapWidth}
            rowHeight={props.cellHeight}
            subSelectionIndex={subSelectionIndex}
            isSelected={IsSelected(subSelectionIndex, SelectionType.Note)}
            pixelsPerSecond={props.pixelsPerSecond}
            borderColor="secondary.500"
            selectedBorderColor="white"
            bgColor="secondary.500"
            borderRadius="sm"
            height={`${props.cellHeight}px`}
            top={`${props.note.keyIndex * props.cellHeight}px`}
            getSelectionRowOffsets={(selectionIndices) =>
                GetNoteSelectionRowOffsets(props.note, selectionIndices)
            }
            getSelectionRowStartIndex={GetNoteSelectionRowStartIndex}
            setRow={SetNoteSelectionRow}
            onMouseDown={(event) => {
                if (event.button === 0) {
                    selectedTrack.sampler.triggerAttackRelease(
                        props.note.key,
                        props.note.duration
                    );
                } else if (event.button === 2) {
                    removeNoteFromSelectedTrack(
                        props.partIndex,
                        props.noteIndex
                    );
                }
            }}
        />
        // {/* <Box
        //     ref={handleRef as any}

        //     onContextMenu={() => {
        //         removeNoteFromSelectedTrack(
        //             props.partIndex,
        //             props.noteIndex
        //         );
        //         return false;
        //     }}
        //     zIndex={9999}
        // /> */}
    );
};
