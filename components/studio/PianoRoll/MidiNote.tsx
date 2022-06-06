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
    GetNoteSelectionRowOffsets,
    GetNoteSelectionRowStartIndex,
    IsNoteDisabled,
    PlayNote,
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
    const selectedTrack = useStore(selectSelectedTrack);
    const selectedNoteIndices = useStore(selectSelectedNoteIndices);

    const subSelectionIndex = {
        containerIndex: props.partIndex,
        selectionIndex: props.noteIndex,
    };

    return (
        // <></>
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
            top={`${props.note.keyIndex * props.cellHeight}px`}
            getSelectionRowOffsets={(selectionIndices) =>
                GetNoteSelectionRowOffsets(props.note, selectionIndices)
            }
            getSelectionRowStartIndex={GetNoteSelectionRowStartIndex}
            setRow={(tracks, row, selectionRowOffsets, selectionStartIndex) => {
                SetNoteSelectionRow(
                    tracks,
                    row,
                    selectionRowOffsets,
                    selectionStartIndex
                );
                PlayNote(selectedTrack, props.note);
            }}
            onMouseDown={(event) => {
                if (event.button === 0) PlayNote(selectedTrack, props.note);
                else if (event.button === 2)
                    DeleteNote(props.partIndex, props.noteIndex);
            }}
        />
    );
};
