import { PianoKeys } from "@Data/Constants";
import { getNoteId } from "@Data/Id";
import { useTracksStore } from "@Data/TracksStore";
import { Note } from "@Interfaces/Note";
import { Part } from "@Interfaces/Part";
import { SubSelectionIndex } from "@Interfaces/Selection";
import { TimeContainer } from "@Interfaces/TimeContainer";
import { Track } from "@Interfaces/Track";
import { ExtendPart } from "./PartUtils";
import { AddNoteToTrack, GetSelectedTrack } from "./TrackUtils";

export const CreateNote = (
    startTime: number,
    duration: number,
    row: number
): Note => {
    return {
        id: getNoteId(),
        startTime: startTime,
        stopTime: startTime + duration,
        keyIndex: row,
        key: PianoKeys[row],
        duration: duration,
        velocity: 1.0,
    };
};

export const GetPartNote = (note: Note) => {
    const partNote = {
        time: note.startTime,
        note: note.key,
        duration: note.duration,
        velocity: note.velocity,
    };

    return partNote;
};

export const PlayNote = (track: Track, note: Note) => {
    track.sampler.triggerAttackRelease(note.key, note.duration);
};

export const IsNoteInPart = (note: Note, part: Part) => {
    return part.startTime <= note.startTime && part.stopTime > note.startTime;
};

export const MakeNotePartRelative = (note: Note, part: Part) => {
    note.startTime -= part.startTime;
    note.stopTime -= part.startTime;
};

export const UpdateNote = (
    partIndex: number,
    noteIndex: number,
    track: Track
) => {
    const part = track.parts[partIndex];
    // console.log(part, partIndex, track);
    const note = part.notes[noteIndex];

    note.startTime += part.startTime;
    note.stopTime += part.startTime;

    part.tonePart.clear();
    // Check if moved position is within the current part
    if (IsNoteInPart(note, part)) {
        // if the end of the note lies beyond the end of the part, extend the part
        if (note.stopTime > part.stopTime) {
            ExtendPart(note, part);
        }
        MakeNotePartRelative(note, part);
    } else {
        // Remove the note from the current part
        part.notes.splice(noteIndex, 1);
        AddNoteToTrack(track, note);
    }

    // Add back all the notes to the part
    part.notes.forEach((note) => {
        part.tonePart.add(GetPartNote(note));
    });
};

export const GetNoteSelectionRowOffsets = (
    note: Note,
    noteIndices: Array<SubSelectionIndex>
): Array<number> => {
    return noteIndices.map(({ containerIndex, selectionIndex }) => {
        return (
            note.keyIndex -
            GetSelectedTrack().parts[containerIndex].notes[selectionIndex]
                .keyIndex
        );
    });
};

export const GetNoteSelectionRowStartIndex = (
    selectedIndices: Array<SubSelectionIndex>
): number => {
    let selectionStartRow = 100000;
    let selectionStartIndex = 0;

    selectedIndices.forEach(({ containerIndex, selectionIndex }, index) => {
        const keyIndex =
            GetSelectedTrack().parts[containerIndex].notes[selectionIndex]
                .keyIndex;
        if (keyIndex < selectionStartRow) {
            selectionStartRow = keyIndex;
            selectionStartIndex = index;
        }
    });

    return selectionStartIndex;
};

export const SetNoteSelectionRow = (
    newRow: number,
    selectionRowOffsets: Array<number>,
    selectionStartRow: number
) => {
    const startRowOffset = selectionRowOffsets[selectionStartRow];
    if (newRow - startRowOffset < 0) {
        const delta = startRowOffset - newRow;
        newRow += delta;
    }
    const tracksCopy = [...useTracksStore.getState().tracks];
    const selectedIndices = useTracksStore.getState().selectedNoteIndices;

    // console.log(selectedIndices);

    selectedIndices.forEach(({ containerIndex, selectionIndex }, index) => {
        const note =
            GetSelectedTrack().parts[containerIndex].notes[selectionIndex];
        const offset = selectionRowOffsets[index];
        const row = newRow - offset;

        note.keyIndex = row;
        note.key = PianoKeys[row];
    });

    useTracksStore.setState({ tracks: tracksCopy });
};

export const ClearSelectedNotesIndices = () => {
    useTracksStore.setState({ selectedNoteIndices: [] });
};
