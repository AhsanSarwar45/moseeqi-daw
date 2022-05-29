import * as Tone from "tone";

import { wholeNoteDivisions } from "@Data/Constants";
import { Note } from "@Interfaces/Note";
import { GetPartNote } from "./NoteUtils";

export const CreateTonePart = (sampler: Tone.Sampler) => {
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
    id: number,
    startTime: number,
    stopTime: number,
    sampler: Tone.Sampler,
    notes: Array<Note> = []
) => {
    const tonePart = CreateTonePart(sampler).start(startTime).stop(stopTime);

    notes.forEach((note) => {
        tonePart.add(GetPartNote(note));
    });

    return {
        id: id,
        tonePart: tonePart,
        startTime: startTime,
        stopTime: stopTime,
        notes: notes,
    };
};

export const GetNewPartStartTime = (
    noteStartTime: number,
    currentSecondsPerDivision: number
) => {
    const noteStartColumn = Math.floor(
        noteStartTime / currentSecondsPerDivision
    );
    // console.log("note moved", noteStartColumn);
    return (
        Math.floor(noteStartColumn / wholeNoteDivisions) *
        wholeNoteDivisions *
        currentSecondsPerDivision
    );
};

export const GetNewPartStopTime = (
    noteStopTime: number,
    currentSecondsPerDivision: number
) => {
    const noteStopColumn = Math.floor(noteStopTime / currentSecondsPerDivision);
    return (
        Math.ceil(noteStopColumn / wholeNoteDivisions) *
        wholeNoteDivisions *
        currentSecondsPerDivision
    );
};

export const GetExtendedPartStopTime = (
    noteStopTime: number,
    currentSecondsPerDivision: number
) => {
    const noteStopColumn = Math.ceil(noteStopTime / currentSecondsPerDivision);
    console.log("noteStopColumn", noteStopColumn);
    return noteStopColumn * currentSecondsPerDivision;
};
