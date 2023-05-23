import * as Tone from "tone";

import { wholeNoteDivisions } from "@Data/Constants";
import { Note } from "@Interfaces/Note";
import { CreateNote, GetPartNote } from "./NoteUtils";
import { getPartId } from "@Data/Id";
import { GetSecondsPerDivision } from "./TimeUtils";
import { Part } from "@Interfaces/Part";
import { Track } from "@Interfaces/Track";
import { StoreState, useStore } from "@Data/Store";
import { MapTimeBlock } from "./TimeBlockUtils";
import { IsIdSelected } from "./SelectionUtils";
import { SelectionType } from "@Interfaces/Selection";
import { setState } from "@Data/Store";
import { PartSaveData } from "@Interfaces/SaveData";
import { produce, Draft } from "immer";
import { SnapDown, SnapUp } from "./SnapUtils";
import {
    Id,
    NoteMap,
    NoteRecord,
    PartMap,
    PartRecord,
    TrackRecord,
} from "@Types/Types";

export const CreateTonePart = (sampler: Draft<Tone.Sampler>) => {
    return new Tone.Part((time, value: any) => {
        sampler.triggerAttackRelease(
            value.note,
            value.duration,
            time,
            value.velocity
        );
    }, []);
};

export const AddPartToTrack = (
    [partId, part]: Draft<PartRecord>,
    [trackId, track]: Draft<TrackRecord>
) => {
    part.tonePart = CreateTonePart(track.sampler);
    SynchronizePart(part);
    part.parentId = trackId;
    part.notes.forEach((note) => (note.trackId = trackId));
    track.parts.set(partId, part);
};

export const CreatePart = (
    startTime: number,
    stopTime: number,
    rowIndex: number,
    notes: Draft<NoteMap> = new Map([])
): PartRecord => {
    return [
        getPartId(),
        {
            tonePart: undefined,
            startTime: startTime,
            stopTime: stopTime,
            rowIndex: rowIndex,
            duration: stopTime - startTime,
            notes: new Map(
                Array.from(notes, ([id, note]) =>
                    CreateNote(note.startTime, note.duration, note.rowIndex)
                )
            ),
            parentId: -1,
        },
    ];
};

export const MapPartTime = (
    part: Draft<Part>,
    mapper: (startTime: number) => number
) => {
    MapTimeBlock(part, mapper);
    part.tonePart?.cancel(0).start(part.startTime).stop(part.stopTime);
};

export const SetPartTime = (
    part: Draft<Part>,
    startTime: number,
    stopTime: number
) => {
    part.startTime = startTime;
    part.stopTime = stopTime;
    part.duration = part.stopTime - part.startTime;
    part.tonePart?.cancel(0).start(part.startTime).stop(part.stopTime);
};

export const UpdatePart = ([partId, part]: Draft<PartRecord>) => {
    part.tonePart?.cancel(0).start(part.startTime).stop(part.stopTime);
};

export const CreatePartInTrack = (
    startTime: number,
    stopTime: number,
    trackIndex: number
) => {
    setState((draftState) => {
        const trackRecord = Array.from(draftState.tracks.entries())[trackIndex];
        const partRecord = CreatePart(startTime, stopTime, trackIndex);
        const [partId, part] = partRecord;
        const [trackId, track] = trackRecord;
        AddPartToTrack(partRecord, trackRecord);
        track.parts.set(partId, part);
    }, "Add part");
};

export const AddNoteToPart = (
    [noteId, note]: Draft<NoteRecord>,
    [partId, part]: Draft<PartRecord>
) => {
    note.parentId = partId;
    note.trackId = part.parentId;
    part.notes.set(noteId, note);
    part.tonePart?.add(GetPartNote(note));
    console.log(part.tonePart);
};

export const SynchronizePartNotes = (part: Draft<Part>) => {
    part.tonePart?.clear();
    part.notes.forEach((note) => {
        part.tonePart?.add(GetPartNote(note));
    });
};

export const SynchronizePart = (part: Draft<Part>) => {
    SynchronizePartNotes(part);
    part.tonePart?.cancel(0).start(part.startTime).stop(part.stopTime);
};

export const ExtendPart = (note: Draft<Note>, part: Draft<Part>) => {
    part.stopTime = GetExtendedPartStopTime(note.stopTime);
    part.duration = part.stopTime - part.startTime;
    part.tonePart?.cancel(0).start(part.startTime).stop(part.stopTime);
};

export const GetNewPartStartTime = (noteStartTime: number) => {
    const secondsPerDivision = GetSecondsPerDivision();
    // const noteStartColumn = Math.floor(noteStartTime / secondsPerDivision);
    return SnapDown(noteStartTime, wholeNoteDivisions * secondsPerDivision);
};

export const GetNewPartStopTime = (noteStopTime: number) => {
    const secondsPerDivision = GetSecondsPerDivision();
    // const noteStopColumn = Math.floor(noteStopTime / secondsPerDivision);
    return SnapUp(noteStopTime, wholeNoteDivisions * secondsPerDivision);
};

export const GetExtendedPartStopTime = (noteStopTime: number) => {
    const secondsPerDivision = GetSecondsPerDivision();
    const noteStopColumn = Math.ceil(noteStopTime / secondsPerDivision);
    return noteStopColumn * secondsPerDivision;
};

export const ClearSelectedPartsIndices = () => {
    if (useStore.getState().selectedPartsId.length) return;
    setState((draftState) => {
        draftState.selectedPartsId = [];
    }, "Deselect all parts");
};

export const DeleteSelectedParts = () => {
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

export const GetPartsSaveData = (parts: PartMap): PartSaveData[] => {
    return Array.from(parts, ([id, part]) => {
        return {
            startTime: part.startTime,
            stopTime: part.stopTime,
            duration: part.duration,
            rowIndex: part.rowIndex,
            notes: Array.from(part.notes.values()),
        };
    });
};
