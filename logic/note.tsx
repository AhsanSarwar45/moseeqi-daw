import { PianoKeys } from "@data/Constants";
import { getNoteId } from "@data/Id";
import { getState, setState } from "@data/stores/project";
import { useStore } from "@data/stores/project";
import { Note } from "@Interfaces/Note";
import { Part } from "@Interfaces/Part";
import { Track } from "@Interfaces/Track";
import {
    NoteMap,
    NoteRecord,
    PartRecord,
    TrackMap,
    TrackRecord,
} from "@Types/Types";
import { produce, Draft } from "immer";
import {
    addNoteToPart,
    addPartToTrack,
    createPart,
    extendPart,
    getNewPartStartTime,
    getNewPartStopTime,
    synchronizePartNotes,
} from "./part";
import { copyTimeBlock, mapTimeBlock } from "./time-block";
import { divisorToDuration } from "./time";
import {
    getLastSelectedTrackConst,
    getSelectedTrack,
    getSelectedTrackRecord,
    getTrackIndexFromId,
} from "./track";
import { NoteSaveData } from "@Interfaces/SaveData";

export const createNote = (
    startTime: number,
    duration: number,
    row: number,
    parentPartRecord: PartRecord | undefined = undefined
): NoteRecord => {
    let parentId = -1;
    let trackId = -1;
    if (parentPartRecord) {
        const [partId, part] = parentPartRecord;
        parentId = partId;
        trackId = part.parentId;
    }
    return [
        getNoteId(),
        {
            startTime: startTime,
            stopTime: startTime + duration,
            rowIndex: row,
            key: PianoKeys[row],
            duration: duration,
            velocity: 1.0,
            parentId: parentId,
            trackId: trackId,
        },
    ];
};

export const getPartNote = (note: Draft<Note>) => {
    return {
        time: note.startTime,
        note: note.key,
        duration: note.duration,
        velocity: note.velocity,
    };
};

export const addNoteToTrack = (
    trackRecord: Draft<TrackRecord>,
    noteRecord: Draft<NoteRecord>
) => {
    const [noteId, note] = noteRecord;
    const [trackId, track] = trackRecord;
    // Check which part the note is in
    const partRecord = Array.from(track.parts.entries()).find(
        ([partId, part]) => {
            return checkIsNoteInPart(note, part);
        }
    );

    // If the note lies in an existing part, add it to the part
    if (partRecord) {
        const [partId, part] = partRecord;
        // if the end of the note lies beyond the end of the part, extend the part
        if (note.stopTime > part.stopTime) {
            extendPart(note, part);
        }
        makeNoteRelative(note, part);
        // console.log(note);
        addNoteToPart(noteRecord, partRecord);
    }
    // If in not in any existing part, create a new part and add the note to it
    else {
        // TODO: add snap settings
        const partStartTime = getNewPartStartTime(note.startTime);
        const partStopTime = getNewPartStopTime(note.stopTime);
        const trackIndex = getTrackIndexFromId(trackId);
        const newPartRecord = createPart(
            partStartTime,
            partStopTime,
            trackIndex
        );
        const [partId, part] = newPartRecord;
        makeNoteRelative(note, part);
        addPartToTrack(newPartRecord, trackRecord);
        addNoteToPart(noteRecord, newPartRecord);
    }
};

export const playNote = (track: Track, note: Note) => {
    playKey(track, note.key, note.duration);
};
export const playKey = (track: Track, key: string, duration: number) => {
    track.sampler.triggerAttackRelease(key, duration);
};

export const playSelectedTrackKey = (key: string, duration: number) => {
    playKey(getLastSelectedTrackConst(), key, duration);
};
export const playSelectedTrackNote = (note: Note) => {
    playNote(getLastSelectedTrackConst(), note);
};

export const mapNoteTime = (
    note: Draft<Note>,
    mapper: (startTime: number) => number
) => {
    mapTimeBlock(note, mapper);
};

export const checkIsNoteInPart = (note: Draft<Note>, part: Draft<Part>) => {
    return part.startTime <= note.startTime && part.stopTime > note.startTime;
};

export const makeNoteRelative = (note: Draft<Note>, part: Draft<Part>) => {
    note.startTime -= part.startTime;
    note.stopTime -= part.startTime;
};

export const makeNoteAbsolute = (note: Draft<Note>, part: Draft<Part>) => {
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
    if (checkIsNoteInPart(note, part)) {
        // if the end of the note lies beyond the end of the part, extend the part
        if (note.stopTime > part.stopTime) {
            extendPart(note, part);
        }
    } else {
        // Remove the note from the current part
        part.notes.delete(noteId);
        makeNoteAbsolute(note, part);
        addNoteToTrack([note.trackId, track], noteRecord);
    }

    synchronizePartNotes(part);
};

export const clearNotesSelection = () => {
    if (!useStore.getState().selectedNotesId.length) return;
    setState((draftState) => {
        draftState.selectedNotesId = [];
    }, "Deselect all notes");
};

export const IsNoteDisabled = (note: Note, part: Part) => {
    return note.startTime >= part.duration || note.startTime < 0;
};

export const deleteNote = ([noteId, note]: NoteRecord) => {
    setState((draftState) => {
        const selectedTrack = getSelectedTrack(draftState) as Draft<Track>;
        const part = selectedTrack.parts.get(note.parentId) as Draft<Part>;
        part.notes.delete(noteId);
        synchronizePartNotes(part);
    }, "Delete note");
};

export const deleteSelectedNotes = () => {
    setState((draftState) => {
        const selectedTrack = getSelectedTrack(draftState) as Draft<Track>;
        draftState.selectedNotesId.forEach(({ containerId, entityId }) => {
            const part = selectedTrack.parts.get(containerId) as Draft<Part>;
            part.notes.delete(entityId);
            synchronizePartNotes(part);
        });

        draftState.selectedNotesId = [];
    }, "Delete notes");
};

export const addNoteToSelectedTrack = (
    startTime: number,
    row: number,
    divisor: number
) => {
    setState((draftState) => {
        const duration = divisorToDuration(divisor);
        const note = createNote(startTime, duration, row);
        const selectedTrackRecord = getSelectedTrackRecord(draftState);

        addNoteToTrack(selectedTrackRecord, note);
        playNote(getLastSelectedTrackConst(), note[1]);
    }, "add note");
};

export const getNotesSaveData = (notes: Note[]): NoteSaveData[] => {
    return notes.map((note) => {
        return {
            startTime: note.startTime,
            stopTime: note.stopTime,
            rowIndex: note.rowIndex,
            key: note.key,
            duration: note.duration,
            velocity: note.velocity,
        };
    });
};
