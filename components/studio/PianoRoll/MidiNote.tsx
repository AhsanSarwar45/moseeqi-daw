import { selectSelectedNotes, useStore } from "@data/stores/project";
import { Part } from "@Interfaces/Part";
import TimeDraggable from "@Components/TimeDraggable";
import { SelectionType } from "@Interfaces/Selection";
import {
    deleteNote,
    IsNoteDisabled,
    playKey,
    playNote,
    playSelectedTrackKey,
    playSelectedTrackNote,
} from "@logic/note";
import { checkIsTimeBlockSelected } from "@logic/selection";
import { PianoKeys } from "@data/Constants";
import { NoteRecord } from "@Types/Types";

interface MidiNoteProps {
    noteRecord: NoteRecord;
    part: Part;
    cellHeight: number;
    cellWidth: number;
    snapWidth: number;
    isSnappingOn: boolean;
    pixelsPerSecond: number;
}

export const MidiNote = (props: MidiNoteProps) => {
    const selectedNotes = useStore(selectSelectedNotes);

    const [noteId, note] = props.noteRecord;

    const HandleResize = (duration: number) => {
        playSelectedTrackKey(PianoKeys[note.rowIndex], duration);
    };

    // console.log(selectedNotes);

    return (
        <TimeDraggable
            timeBlockRecord={props.noteRecord}
            selectionType={SelectionType.Note}
            snapWidth={props.snapWidth}
            rowHeight={props.cellHeight}
            isSelected={checkIsTimeBlockSelected(
                props.noteRecord,
                selectedNotes
            )}
            pixelsPerSecond={props.pixelsPerSecond}
            borderColor={
                IsNoteDisabled(note, props.part) ? "gray.600" : "secondary.600"
            }
            selectedBorderColor="white"
            bgColor={
                IsNoteDisabled(note, props.part) ? "gray.500" : "secondary.500"
            }
            borderRadius="sm"
            height={`${props.cellHeight}px`}
            top={`${note.rowIndex * props.cellHeight}px`}
            onDragY={(rowIndex) =>
                playSelectedTrackKey(PianoKeys[rowIndex], note.duration)
            }
            onResizeLeftStop={(startTime, initialTimeBlock) =>
                HandleResize(initialTimeBlock.stopTime - startTime)
            }
            onResizeRightStop={(stopTime, initialTimeBlock) =>
                HandleResize(stopTime - initialTimeBlock.startTime)
            }
            onMouseDown={(event) => {
                if (event.button === 0) playSelectedTrackNote(note);
                if (event.button === 2) deleteNote(props.noteRecord);
            }}
        />
    );
};
