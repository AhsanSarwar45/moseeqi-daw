import { Box } from "@chakra-ui/react";

import { useContext, useEffect, useRef, useState } from "react";
import { Rnd } from "react-rnd";

import {
    selectRemoveNoteFromSelectedTrack,
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

    const OnNoteClick = (key: string, duration: number) => {
        selectedTrack.sampler.triggerAttackRelease(key, duration);
    };

    const handleRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        handleRef.current?.addEventListener(
            "contextmenu",
            function (event: any) {
                event.preventDefault();
                return false;
            },
            false
        );
    }, []);

    return (
        // <></>
        <TimeDraggable
            timeContainer={props.note}
            selectionType={SelectionType.Note}
            snapWidth={props.snapWidth}
            rowHeight={props.cellHeight}
            subSelectionIndex={{
                containerIndex: props.partIndex,
                selectionIndex: props.noteIndex,
            }}
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
