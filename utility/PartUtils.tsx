import * as Tone from "tone";

import { wholeNoteDivisions } from "@Data/Constants";
import { Note } from "@Interfaces/Note";
import { GetPartNote } from "./NoteUtils";
import { getPartId } from "@Data/Id";
import { GetSecondsPerDivision } from "./TimeUtils";
import { Part } from "@Interfaces/Part";
import { Track } from "@Interfaces/Track";
import { useStore } from "@Data/Store";
import { MapTimeBlock } from "./TimeBlockUtils";

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
    startTime: number,
    stopTime: number,
    sampler: Tone.Sampler,
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
        duration: stopTime - startTime,
        notes: notes,
    };
};

export const MapPartTime = (
    part: Part,
    mapper: (startTime: number) => number
) => {
    MapTimeBlock(part, mapper);
    part.tonePart.cancel(0).start(part.startTime).stop(part.stopTime);
};

export const SetPartTime = (
    part: Part,
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
    tracksCopy: Array<Track>
) => {
    const part = tracksCopy[trackIndex].parts[partIndex];
    part.tonePart.cancel(0).start(part.startTime).stop(part.stopTime);
};

export const AddNoteToPart = (note: Note, part: Part) => {
    part.notes.push(note);
    part.tonePart.add(GetPartNote(note));
};

export const ExtendPart = (note: Note, part: Part): Part => {
    part.stopTime = GetExtendedPartStopTime(note.stopTime);
    part.duration = part.stopTime - part.startTime;
    part.tonePart.cancel(0).start(part.startTime).stop(part.stopTime);

    return part;
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
    useStore.setState({ selectedPartIndices: [] });
};
