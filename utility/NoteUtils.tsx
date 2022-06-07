import { PianoKeys } from "@Data/Constants";
import { getNoteId } from "@Data/Id";
import { SetState } from "@Data/Store";
import { useStore } from "@Data/Store";
import { Note } from "@Interfaces/Note";
import { Part } from "@Interfaces/Part";
import { SelectionType, SubSelectionIndex } from "@Interfaces/Selection";
import { Track } from "@Interfaces/Track";
import produce, { Draft } from "immer";
import { ExtendPart, SynchronizePartNotes } from "./PartUtils";
import { IsSelected } from "./SelectionUtils";
import { MapTimeBlock } from "./TimeBlockUtils";
import { DivisorToDuration } from "./TimeUtils";
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
        rowIndex: row,
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
    PlayKey(track, note.key, note.duration);
};
export const PlayKey = (track: Track, key: string, duration: number) => {
    track.sampler.triggerAttackRelease(key, duration);
};

export const PlaySelectedTrackKey = (key: string, duration: number) => {
    const selectedTrack = GetSelectedTrack();
    PlayKey(selectedTrack, key, duration);
};
export const PlaySelectedTrackNote = (note: Note) => {
    const selectedTrack = GetSelectedTrack();
    PlayNote(selectedTrack, note);
};

export const MapNoteTime = (
    note: Note,
    mapper: (startTime: number) => number
) => {
    MapTimeBlock(note, mapper);
};

export const IsNoteInPart = (note: Note, part: Draft<Part>) => {
    return part.startTime <= note.startTime && part.stopTime > note.startTime;
};

export const MakeNotePartRelative = (note: Draft<Note>, part: Draft<Part>) => {
    note.startTime -= part.startTime;
    note.stopTime -= part.startTime;
};

export const UpdateNote = (
    partIndex: number,
    noteIndex: number,
    track: Draft<Track>
) => {
    const part = track.parts[partIndex];
    const note = part.notes[noteIndex];

    note.startTime += part.startTime;
    note.stopTime += part.startTime;
    note.key = PianoKeys[note.rowIndex];

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

    SynchronizePartNotes(part);
};

export const ClearSelectedNotesIndices = () => {
    if (useStore.getState().selectedNoteIndices.length === 0) return;
    SetState((draftState) => {
        draftState.selectedNoteIndices = [];
    }, "Deselect all notes");
};

export const IsNoteDisabled = (note: Note, part: Part) => {
    return note.startTime >= part.duration || note.startTime < 0;
};

export const DeleteNote = (partIndex: number, noteIndex: number) => {
    SetState((draftState) => {
        const selectedTrack = draftState.tracks[draftState.selectedTrackIndex];
        const part = selectedTrack.parts[partIndex];
        const note = part.notes[noteIndex];
        // Remove the note from the part
        part.notes = part.notes.filter((n) => n.id !== note.id);
        SynchronizePartNotes(part);
    }, "Delete note");
};

export const DeleteSelectedNotes = () => {
    SetState((draftState) => {
        const selectedTrack = draftState.tracks[draftState.selectedTrackIndex];
        selectedTrack.parts = selectedTrack.parts.map((part, partIndex) => {
            part.notes = part.notes.filter((note, noteIndex) => {
                if (
                    IsSelected(
                        {
                            containerIndex: partIndex,
                            selectionIndex: noteIndex,
                        },
                        SelectionType.Note
                    )
                ) {
                    return false;
                }
                return true;
            });
            SynchronizePartNotes(part);
            return part;
        });

        draftState.selectedNoteIndices = [];
    }, "Delete notes");
};

export const AddNoteToSelectedTrack = (
    startTime: number,
    row: number,
    divisor: number
) => {
    SetState((draftState) => {
        const duration = DivisorToDuration(divisor);
        const note = CreateNote(startTime, duration, row);
        const selectedTrack = draftState.tracks[draftState.selectedTrackIndex];
        AddNoteToTrack(selectedTrack, note);
        PlayNote(GetSelectedTrack(), note);
    }, "Add note");
};
