import { PianoKeys } from "@Data/Constants";
import { getNoteId } from "@Data/Id";
import { getState, setState } from "@Data/Store";
import { useStore } from "@Data/Store";
import { Note } from "@Interfaces/Note";
import { Part } from "@Interfaces/Part";
import { SelectionType } from "@Interfaces/Selection";
import { Track } from "@Interfaces/Track";
import { NoteRecord, TrackMap, TrackRecord } from "@Types/Types";
import { produce, Draft } from "immer";
import {
    AddNoteToPart,
    AddPartToTrack,
    CreatePart,
    ExtendPart,
    GetNewPartStartTime,
    GetNewPartStopTime,
    SynchronizePartNotes,
} from "./PartUtils";
import { CopyTimeBlock, MapTimeBlock } from "./TimeBlockUtils";
import { DivisorToDuration } from "./TimeUtils";
import {
    GetLastSelectedTrackConst,
    GetSelectedTrack,
    GetSelectedTrackRecord,
    GetTrackIndexFromId,
} from "./TrackUtils";

export const CreateNote = (
    startTime: number,
    duration: number,
    row: number
): NoteRecord => {
    return [
        getNoteId(),
        {
            startTime: startTime,
            stopTime: startTime + duration,
            rowIndex: row,
            key: PianoKeys[row],
            duration: duration,
            velocity: 1.0,
            parentId: -1,
            trackId: -1,
        },
    ];
};

export const GetPartNote = (note: Draft<Note>) => {
    return {
        time: note.startTime,
        note: note.key,
        duration: note.duration,
        velocity: note.velocity,
    };
};

export const AddNoteToTrack = (
    trackRecord: Draft<TrackRecord>,
    noteRecord: Draft<NoteRecord>
) => {
    const [noteId, note] = noteRecord;
    const [trackId, track] = trackRecord;
    // Check which part the note is in
    const partRecord = Array.from(track.parts.entries()).find(
        ([partId, part]) => {
            return IsNoteInPart(note, part);
        }
    );

    // If the note lies in an existing part, add it to the part
    if (partRecord) {
        const [partId, part] = partRecord;
        // if the end of the note lies beyond the end of the part, extend the part
        if (note.stopTime > part.stopTime) {
            ExtendPart(note, part);
        }
        MakeNoteRelative(note, part);
        // console.log(note);
        AddNoteToPart(noteRecord, partRecord);
    }
    // If in not in any existing part, create a new part and add the note to it
    else {
        // TODO: Add snap settings
        const partStartTime = GetNewPartStartTime(note.startTime);
        const partStopTime = GetNewPartStopTime(note.stopTime);
        const trackIndex = GetTrackIndexFromId(trackId);
        const newPartRecord = CreatePart(
            partStartTime,
            partStopTime,
            trackIndex
        );
        const [partId, part] = newPartRecord;
        MakeNoteRelative(note, part);
        AddPartToTrack(newPartRecord, trackRecord);
        AddNoteToPart(noteRecord, newPartRecord);
    }
};

export const PlayNote = (track: Track, note: Note) => {
    PlayKey(track, note.key, note.duration);
};
export const PlayKey = (track: Track, key: string, duration: number) => {
    track.sampler.triggerAttackRelease(key, duration);
};

export const PlaySelectedTrackKey = (key: string, duration: number) => {
    PlayKey(GetLastSelectedTrackConst(), key, duration);
};
export const PlaySelectedTrackNote = (note: Note) => {
    PlayNote(GetLastSelectedTrackConst(), note);
};

export const MapNoteTime = (
    note: Draft<Note>,
    mapper: (startTime: number) => number
) => {
    MapTimeBlock(note, mapper);
};

export const IsNoteInPart = (note: Draft<Note>, part: Draft<Part>) => {
    return part.startTime <= note.startTime && part.stopTime > note.startTime;
};

export const MakeNoteRelative = (note: Draft<Note>, part: Draft<Part>) => {
    note.startTime -= part.startTime;
    note.stopTime -= part.startTime;
};

export const MakeNoteAbsolute = (note: Draft<Note>, part: Draft<Part>) => {
    note.startTime += part.startTime;
    note.stopTime += part.startTime;
};

export const UpdateNote = (
    noteRecord: Draft<NoteRecord>,
    tracks: Draft<TrackMap>
) => {
    const [noteId, note] = noteRecord;
    const track = tracks.get(note.trackId) as Draft<Track>;
    const part = track.parts.get(note.parentId) as Draft<Part>;

    note.key = PianoKeys[note.rowIndex];

    // Check if moved position is within the current part
    if (IsNoteInPart(note, part)) {
        // if the end of the note lies beyond the end of the part, extend the part
        if (note.stopTime > part.stopTime) {
            ExtendPart(note, part);
        }
    } else {
        // Remove the note from the current part
        part.notes.delete(noteId);
        MakeNoteAbsolute(note, part);
        AddNoteToTrack([note.trackId, track], noteRecord);
    }

    SynchronizePartNotes(part);
};

export const ClearNotesSelection = () => {
    if (!useStore.getState().selectedNotesId.length) return;
    setState((draftState) => {
        draftState.selectedNotesId = [];
    }, "Deselect all notes");
};

export const IsNoteDisabled = (note: Note, part: Part) => {
    return note.startTime >= part.duration || note.startTime < 0;
};

export const DeleteNote = ([noteId, note]: NoteRecord) => {
    setState((draftState) => {
        const selectedTrack = GetSelectedTrack(draftState) as Draft<Track>;
        const part = selectedTrack.parts.get(note.parentId) as Draft<Part>;
        part.notes.delete(noteId);
        SynchronizePartNotes(part);
    }, "Delete note");
};

export const DeleteSelectedNotes = () => {
    setState((draftState) => {
        const selectedTrack = GetSelectedTrack(draftState) as Draft<Track>;
        draftState.selectedPartsId.forEach(({ containerId, entityId }) => {
            const part = selectedTrack.parts.get(containerId) as Draft<Part>;
            part.tonePart?.cancel(0);
            part.notes.delete(entityId);
            SynchronizePartNotes(part);
        });

        draftState.selectedNotesId = [];
    }, "Delete notes");
};

export const AddNoteToSelectedTrack = (
    startTime: number,
    row: number,
    divisor: number
) => {
    setState((draftState) => {
        const duration = DivisorToDuration(divisor);
        const note = CreateNote(startTime, duration, row);
        const selectedTrackRecord = GetSelectedTrackRecord(draftState);

        AddNoteToTrack(selectedTrackRecord, note);
        PlayNote(GetLastSelectedTrackConst(), note[1]);
    }, "Add note");
};
