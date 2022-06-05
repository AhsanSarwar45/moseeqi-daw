import {
    selectSelectedNoteIndices,
    selectSelectedTrack,
    useTracksStore,
} from "@Data/TracksStore";
import { Note } from "@Interfaces/Note";
import { Part } from "@Interfaces/Part";
import TimeDraggable from "@Components/TimeDraggable";
import { SelectionType } from "@Interfaces/Selection";
import {
    DeleteNote,
    GetNoteSelectionRowOffsets,
    GetNoteSelectionRowStartIndex,
    IsNoteDisabled,
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
            setRow={SetNoteSelectionRow}
            onMouseDown={(event) => {
                if (event.button === 0) {
                    selectedTrack.sampler.triggerAttackRelease(
                        props.note.key,
                        props.note.duration
                    );
                } else if (event.button === 2) {
                    DeleteNote(props.partIndex, props.noteIndex);
                }
            }}
        />
    );
};
