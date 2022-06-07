import {
    selectSelectedNoteIndices,
    selectSelectedTrack,
    useStore,
} from "@Data/Store";
import { Note } from "@Interfaces/Note";
import { Part } from "@Interfaces/Part";
import TimeDraggable from "@Components/TimeDraggable";
import { SelectionType } from "@Interfaces/Selection";
import {
    DeleteNote,
    IsNoteDisabled,
    PlayKey,
    PlayNote,
    PlaySelectedTrackKey,
    PlaySelectedTrackNote,
} from "@Utility/NoteUtils";
import { IsSelected } from "@Utility/SelectionUtils";
import { useEffect } from "react";
import { PianoKeys } from "@Data/Constants";

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
    const selectedNoteIndices = useStore(selectSelectedNoteIndices);

    const subSelectionIndex = {
        containerIndex: props.partIndex,
        selectionIndex: props.noteIndex,
    };

    const HandleResize = (duration: number) => {
        PlaySelectedTrackKey(PianoKeys[props.note.rowIndex], duration);
    };

    return (
        <TimeDraggable
            timeBlock={props.note}
            selectionType={SelectionType.Note}
            snapWidth={props.snapWidth}
            rowHeight={props.cellHeight}
            subSelectionIndex={subSelectionIndex}
            isSelected={IsSelected(subSelectionIndex, SelectionType.Note)}
            pixelsPerSecond={props.pixelsPerSecond}
            borderColor={
                IsNoteDisabled(props.note, props.part)
                    ? "gray.600"
                    : "secondary.600"
            }
            selectedBorderColor="white"
            bgColor={
                IsNoteDisabled(props.note, props.part)
                    ? "gray.500"
                    : "secondary.500"
            }
            borderRadius="sm"
            height={`${props.cellHeight}px`}
            top={`${props.note.rowIndex * props.cellHeight}px`}
            onDragY={(rowIndex) =>
                PlaySelectedTrackKey(PianoKeys[rowIndex], props.note.duration)
            }
            onResizeLeftStop={(startTime, initialTimeBlock) =>
                HandleResize(initialTimeBlock.stopTime - startTime)
            }
            onResizeRightStop={(stopTime, initialTimeBlock) =>
                HandleResize(stopTime - initialTimeBlock.startTime)
            }
            onMouseDown={(event) => {
                if (event.button === 0) PlaySelectedTrackNote(props.note);
                if (event.button === 2)
                    DeleteNote(props.partIndex, props.noteIndex);
            }}
        />
    );
};
