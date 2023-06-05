import * as Tone from "tone";

import { wholeNoteDivisions } from "@data/constants";
import { Note } from "@interfaces/note";
import { addNoteToPart, getNotesSaveData, getPartNote } from "./note";
import { getPartId } from "@data/id";
import { getSecondsPerDivision } from "./time";
import { Part } from "@interfaces/part";
import { StoreState, useStore } from "@data/stores/project";
import { mapTimeBlock } from "./time-block";
import { setState } from "@data/stores/project";
import { NoteSaveData, PartSaveData } from "@interfaces/save-data";
import { produce, Draft } from "immer";
import { snapDown, snapUp } from "./snap";
import {
    Id,
    NoteMap,
    NoteRecord,
    PartMap,
    PartRecord,
    TrackRecord,
} from "@custom-types/types";

export const createTonePart = (sampler: Draft<Tone.Sampler>) => {
    return new Tone.Part((time, value: any) => {
        sampler.triggerAttackRelease(
            value.note,
            value.duration,
            time,
            value.velocity
        );
    }, []);
};

// export const addPartToTrack = (
//     partData: PartSaveData,
//     trackRecord: Draft<TrackRecord>
// ) => {
//     createPart(
//         partData.startTime,
//         partData.stopTime,
//         partData.rowIndex,
//         trackRecord,
//         partData.notes
//     );
// };

export const addPartToTrack = (
    parentTrackRecord: Draft<TrackRecord>,
    startTime: number,
    stopTime: number,
    rowIndex: number,
    notesData: Array<NoteSaveData> = []
): PartRecord => {
    const id = getPartId();

    const [trackId, track] = parentTrackRecord;
    const parentId = trackId;

    const partRecord: PartRecord = [
        id,
        {
            tonePart: createTonePart(track.sampler),
            startTime: startTime,
            stopTime: stopTime,
            rowIndex: rowIndex,
            duration: stopTime - startTime,
            notes: new Map<Id, Note>(),
            parentId: parentId,
        },
    ];

    const [partId, part] = partRecord;

    track.parts.set(id, part);

    notesData.forEach((noteData) => {
        addNoteToPart(
            partRecord,
            noteData.startTime,
            noteData.duration,
            noteData.rowIndex
        );
    });

    return partRecord;
};

export const mapPartTime = (
    part: Draft<Part>,
    mapper: (startTime: number) => number
) => {
    mapTimeBlock(part, mapper);
    part.tonePart.cancel(0).start(part.startTime).stop(part.stopTime);
};

export const setPartTime = (
    part: Draft<Part>,
    startTime: number,
    stopTime: number
) => {
    part.startTime = startTime;
    part.stopTime = stopTime;
    part.duration = part.stopTime - part.startTime;
    part.tonePart.cancel(0).start(part.startTime).stop(part.stopTime);
};

export const updatePart = ([partId, part]: Draft<PartRecord>) => {
    part.tonePart.cancel(0).start(part.startTime).stop(part.stopTime);
};

export const addPartToTrackIndex = (
    startTime: number,
    stopTime: number,
    trackIndex: number
) => {
    setState((draftState) => {
        const trackRecord = Array.from(draftState.tracks.entries())[trackIndex];
        addPartToTrack(trackRecord, startTime, stopTime, trackIndex, []);
        // const [partId, part] = partRecord;
        // const [trackId, track] = trackRecord;
        // track.parts.set(partId, part);
    }, "add part");
};

// export const addNoteToPart = (
//     [noteId, note]: Draft<NoteRecord>,
//     [partId, part]: Draft<PartRecord>
// ) => {
//     note.parentId = partId;
//     note.trackId = part.parentId;
//     part.notes.set(noteId, note);
//     part.tonePart.add(getPartNote(note));
// };

export const synchronizePartNotes = (part: Draft<Part>) => {
    // It isn't possible to edit notes in a tone part, so we have to clear it and re-add all the notes
    part.tonePart.clear();
    part.notes.forEach((note) => {
        part.tonePart.add(getPartNote(note));
    });
};

// Synchronize the part with Tone backend
export const synchronizePart = (part: Draft<Part>) => {
    synchronizePartNotes(part);
    part.tonePart.cancel(0).start(part.startTime).stop(part.stopTime);
};

export const extendPart = (noteData: NoteSaveData, part: Draft<Part>) => {
    part.stopTime = getExtendedPartStopTime(noteData.stopTime);
    part.duration = part.stopTime - part.startTime;
    part.tonePart.cancel(0).start(part.startTime).stop(part.stopTime);
};

export const getNewPartStartTime = (noteStartTime: number) => {
    const secondsPerDivision = getSecondsPerDivision();
    // const noteStartColumn = Math.floor(noteStartTime / secondsPerDivision);
    return snapDown(noteStartTime, wholeNoteDivisions * secondsPerDivision);
};

export const getNewPartStopTime = (noteStopTime: number) => {
    const secondsPerDivision = getSecondsPerDivision();
    // const noteStopColumn = Math.floor(noteStopTime / secondsPerDivision);
    return snapUp(noteStopTime, wholeNoteDivisions * secondsPerDivision);
};

export const getExtendedPartStopTime = (noteStopTime: number) => {
    const secondsPerDivision = getSecondsPerDivision();
    const noteStopColumn = Math.ceil(noteStopTime / secondsPerDivision);
    return noteStopColumn * secondsPerDivision;
};

export const clearSelectedPartsIndices = () => {
    if (useStore.getState().selectedPartsId.length) return;
    setState((draftState) => {
        draftState.selectedPartsId = [];
    }, "Deselect all parts");
};

export const deleteSelectedParts = () => {
    setState((draftState) => {
        draftState.selectedPartsId.forEach(({ containerId, entityId }) => {
            const track = draftState.tracks.get(containerId);
            const part = track?.parts.get(entityId);
            part?.tonePart?.cancel(0);
            track?.parts.delete(entityId);
        });

        draftState.selectedPartsId = [];
        draftState.selectedNotesId = [];
    }, "Delete parts");
};

export const getPartSaveData = (part: Part): PartSaveData => {
    return {
        startTime: part.startTime,
        stopTime: part.stopTime,
        duration: part.duration,
        rowIndex: part.rowIndex,
        notes: getNotesSaveData(Array.from(part.notes.values())),
    };
};

export const getPartsSaveData = (parts: Part[]): PartSaveData[] => {
    return parts.map((part) => {
        return {
            startTime: part.startTime,
            stopTime: part.stopTime,
            duration: part.duration,
            rowIndex: part.rowIndex,
            notes: getNotesSaveData(Array.from(part.notes.values())),
        };
    });
};
