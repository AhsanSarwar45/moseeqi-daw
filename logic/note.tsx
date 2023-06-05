import { PianoKeys } from "@data/constants";
import { getNoteId } from "@data/id";
import { getState, setState } from "@data/stores/project";
import { useStore } from "@data/stores/project";
import { Note } from "@interfaces/note";
import { Part } from "@interfaces/part";
import { Track } from "@interfaces/track";
import {
    NoteMap,
    NoteRecord,
    PartRecord,
    TrackMap,
    TrackRecord,
} from "@custom-types/types";
import { produce, Draft } from "immer";
import {
    addPartToTrack,
    extendPart,
    getNewPartStartTime,
    getNewPartStopTime,
    synchronizePartNotes,
} from "./part";
import { copyTimeBlock, mapTimeBlock } from "./time-block";
import { divisorToDuration } from "./time";
import {
    getLastSelectedTrackConst,
    getLastSelectedTrack,
    getLastSelectedTrackRecord,
    getTrackIndexFromId,
} from "./track";
import { NoteSaveData } from "@interfaces/save-data";

export const addNoteToPart = (
    parentPartRecord: Draft<PartRecord>,
    startTime: number,
    duration: number,
    rowIndex: number
): NoteRecord => {
    const [partId, part] = parentPartRecord;
    const parentId = partId;
    const trackId = part.parentId;
    const noteRecord: NoteRecord = [
        getNoteId(),
        {
            startTime: startTime,
            stopTime: startTime + duration,
            rowIndex: rowIndex,
            key: PianoKeys[rowIndex],
            duration: duration,
            velocity: 1.0,
            parentId: parentId,
            trackId: trackId,
        },
    ];
    const [noteId, note] = noteRecord;
    part.notes.set(noteId, note);
    part.tonePart.add(getPartNote(note));

    return noteRecord;
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
    noteData: NoteSaveData
): NoteRecord => {
    const [trackId, track] = trackRecord;
    // Check which part the note is in
    let partRecord = Array.from(track.parts.entries()).find(
        ([partId, part]) => {
            return checkIsNoteInPart(noteData, part);
        }
    );

    // If the note lies in an existing part, add it to the part
    if (partRecord) {
        const [partId, part] = partRecord;
        // if the end of the note lies beyond the end of the part, extend the part
        if (noteData.stopTime > part.stopTime) {
            extendPart(noteData, part);
        }
        // makeNoteRelativeToPart(note, part);
        // console.log(note);
    }
    // If in not in any existing part, create a new part and add the note to it
    else {
        // TODO: add snap settings
        const partStartTime = getNewPartStartTime(noteData.startTime);
        const partStopTime = getNewPartStopTime(noteData.stopTime);
        const trackIndex = getTrackIndexFromId(trackId);
        const newPartRecord = addPartToTrack(
            trackRecord,
            partStartTime,
            partStopTime,
            trackIndex,
            []
        );
        partRecord = newPartRecord;
        // makeNoteRelativeToPart(note, part);
    }

    const [partId, part] = partRecord;

    const noteRecord = addNoteToPart(
        partRecord,
        noteData.startTime,
        noteData.duration,
        noteData.rowIndex
    );

    const [noteId, note] = noteRecord;

    makeNoteRelativeToPart(note, part);

    return noteRecord;
};

export const playNote = (track: Track | undefined, note: Note) => {
    playKey(track, note.key, note.duration);
};
export const playKey = (
    track: Track | undefined,
    key: string,
    duration: number
) => {
    track?.sampler.triggerAttackRelease(key, duration);
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

export const checkIsNoteInPart = (
    noteData: NoteSaveData,
    part: Draft<Part>
) => {
    return (
        part.startTime <= noteData.startTime &&
        part.stopTime > noteData.startTime
    );
};

export const makeNoteRelativeToPart = (
    note: Draft<Note>,
    part: Draft<Part>
) => {
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
        addNoteToTrack([note.trackId, track], getNoteSaveData(note));
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
        const selectedTrack = getLastSelectedTrack(draftState) as Draft<Track>;
        const part = selectedTrack.parts.get(note.parentId) as Draft<Part>;
        part.notes.delete(noteId);
        synchronizePartNotes(part);
    }, "Delete note");
};

export const deleteSelectedNotes = () => {
    setState((draftState) => {
        const selectedTrack = getLastSelectedTrack(draftState) as Draft<Track>;
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
        const selectedTrackRecord = getLastSelectedTrackRecord(draftState);

        if (selectedTrackRecord === undefined) return;

        const duration = divisorToDuration(divisor);
        const [noteId, note] = addNoteToTrack(
            selectedTrackRecord,
            createNoteSaveData(startTime, duration, row)
        );
        playNote(getLastSelectedTrackConst(), note);
    }, "Add note");
};

export const getNoteSaveData = (note: Note) => {
    return {
        startTime: note.startTime,
        stopTime: note.stopTime,
        rowIndex: note.rowIndex,
        key: note.key,
        duration: note.duration,
        velocity: note.velocity,
    };
};

export const getNotesSaveData = (notes: Note[]): NoteSaveData[] => {
    return notes.map((note) => {
        return getNoteSaveData(note);
    });
};

export const createNoteSaveData = (
    startTime: number,
    duration: number,
    rowIndex: number,
    velocity: number = 1
) => {
    return {
        startTime: startTime,
        stopTime: startTime + duration,
        rowIndex: rowIndex,
        key: PianoKeys[rowIndex],
        duration: duration,
        velocity: velocity,
    };
};
