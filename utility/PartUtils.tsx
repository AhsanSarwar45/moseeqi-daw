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
import { IsSelected } from "./SelectionUtils";
import { SelectionType } from "@Interfaces/Selection";
import { SetState } from "@Data/Store";
import { PartSaveData } from "@Interfaces/SaveData";
import produce, { Draft } from "immer";

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

export const CreatePart = (
    startTime: number,
    stopTime: number,
    sampler: Draft<Tone.Sampler>,
    notes: Array<Note> = []
): Part => {
    const tonePart = CreateTonePart(sampler).start(startTime).stop(stopTime);

    notes.forEach((note) => {
        tonePart.add(GetPartNote(note));
    });

    return {
        id: getPartId(),
        tonePart: tonePart,
        startTime: startTime,
        stopTime: stopTime,
        rowIndex: 0,
        duration: stopTime - startTime,
        notes: notes.map((note) =>
            CreateNote(note.startTime, note.duration, note.rowIndex)
        ),
    };
};

export const MapPartTime = (
    part: Draft<Part>,
    mapper: (startTime: number) => number
) => {
    MapTimeBlock(part, mapper);
    part.tonePart.cancel(0).start(part.startTime).stop(part.stopTime);
};

export const SetPartTime = (
    part: Draft<Part>,
    startTime: number,
    stopTime: number
) => {
    part.startTime = startTime;
    part.stopTime = stopTime;
    part.duration = part.stopTime - part.startTime;
    part.tonePart.cancel(0).start(part.startTime).stop(part.stopTime);
};

export const UpdatePart = (
    trackIndex: number,
    partIndex: number,
    tracks: Draft<Track>[]
) => {
    const part = tracks[trackIndex].parts[partIndex];
    part.tonePart.cancel(0).start(part.startTime).stop(part.stopTime);
};

export const AddNoteToPart = (note: Note, part: Draft<Part>) => {
    part.notes.push(note);
    part.tonePart.add(GetPartNote(note));
};

export const SynchronizePartNotes = (part: Draft<Part>) => {
    part.tonePart.clear();
    part.notes.forEach((note) => {
        part.tonePart.add(GetPartNote(note));
    });
};

export const SynchronizePart = (part: Draft<Part>) => {
    SynchronizePartNotes(part);
    part.tonePart.cancel(0).start(part.startTime).stop(part.stopTime);
};

export const ExtendPart = (note: Note, part: Draft<Part>) => {
    part.stopTime = GetExtendedPartStopTime(note.stopTime);
    part.duration = part.stopTime - part.startTime;
    part.tonePart.cancel(0).start(part.startTime).stop(part.stopTime);
};

export const GetNewPartStartTime = (noteStartTime: number) => {
    const secondsPerDivision = GetSecondsPerDivision();
    const noteStartColumn = Math.floor(noteStartTime / secondsPerDivision);
    return (
        Math.floor(noteStartColumn / wholeNoteDivisions) *
        wholeNoteDivisions *
        secondsPerDivision
    );
};

export const GetNewPartStopTime = (noteStopTime: number) => {
    const secondsPerDivision = GetSecondsPerDivision();
    const noteStopColumn = Math.floor(noteStopTime / secondsPerDivision);
    return (
        Math.ceil(noteStopColumn / wholeNoteDivisions) *
        wholeNoteDivisions *
        secondsPerDivision
    );
};

export const GetExtendedPartStopTime = (noteStopTime: number) => {
    const secondsPerDivision = GetSecondsPerDivision();
    const noteStopColumn = Math.ceil(noteStopTime / secondsPerDivision);
    return noteStopColumn * secondsPerDivision;
};

export const ClearSelectedPartsIndices = () => {
    if (useStore.getState().selectedPartIndices.length === 0) return;
    SetState((draftState) => {
        draftState.selectedPartIndices = [];
    }, "Deselect all parts");
};

export const DeleteSelectedParts = () => {
    SetState((draftState) => {
        draftState.tracks.forEach((track, trackIndex) => {
            track.parts = track.parts.filter((part, partIndex) => {
                if (
                    IsSelected(
                        {
                            containerIndex: trackIndex,
                            selectionIndex: partIndex,
                        },
                        SelectionType.Part
                    )
                ) {
                    part.tonePart.cancel(0);
                    return false;
                }
                return true;
            });
            return track;
        });

        draftState.selectedPartIndices = [];
        draftState.selectedNoteIndices = [];
    }, "Delete parts");
};

export const GetPartsSaveData = (parts: readonly Part[]): PartSaveData[] => {
    return parts.map((part) => {
        return {
            startTime: part.startTime,
            stopTime: part.stopTime,
            duration: part.duration,
            rowIndex: part.rowIndex,
            notes: [...part.notes],
        };
    });
};
