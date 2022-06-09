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
import { SnapDown, SnapUp } from "./SnapUtils";

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
    trackIndex: number,
    notes: Note[] = []
): Part => {
    const track = useStore.getState().tracks[trackIndex];
    const tonePart = CreateTonePart(track.sampler)
        .start(startTime)
        .stop(stopTime);

    notes.forEach((note) => {
        tonePart.add(GetPartNote(note));
    });

    return {
        id: getPartId(),
        tonePart: tonePart,
        startTime: startTime,
        stopTime: stopTime,
        rowIndex: trackIndex,
        duration: stopTime - startTime,
        timeBlocks: notes.map((note) =>
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
    prevTracks: Draft<Track>[]
) => {
    const part = prevTracks[trackIndex].timeBlocks[partIndex] as Draft<Part>;
    part.tonePart.cancel(0).start(part.startTime).stop(part.stopTime);
};

export const AddPartToTrack = (
    startTime: number,
    stopTime: number,
    trackIndex: number
) => {
    SetState((draftState) => {
        const track = draftState.tracks[trackIndex];
        const part = CreatePart(startTime, stopTime, trackIndex);
        track.timeBlocks.push(part);
    }, "Add part");
};

export const AddNoteToPart = (note: Note, part: Draft<Part>) => {
    part.timeBlocks.push(note);
    part.tonePart.add(GetPartNote(note));
};

export const SynchronizePartNotes = (part: Draft<Part>) => {
    part.tonePart.clear();
    part.timeBlocks.forEach((note) => {
        part.tonePart.add(GetPartNote(note as Note));
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
    if (useStore.getState().selectedPartIndices.length === 0) return;
    SetState((draftState) => {
        draftState.selectedPartIndices = [];
    }, "Deselect all parts");
};

export const DeleteSelectedParts = () => {
    SetState((draftState) => {
        draftState.tracks.forEach((track, trackIndex) => {
            track.timeBlocks = track.timeBlocks.filter(
                (partTimeBlock, partIndex) => {
                    const part = partTimeBlock as Part;
                    if (
                        IsSelected(
                            {
                                containerIndex: trackIndex,
                                subContainerIndex: partIndex,
                            },
                            SelectionType.Part
                        )
                    ) {
                        part.tonePart.cancel(0);
                        return false;
                    }
                    return true;
                }
            );
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
            notes: [...part.timeBlocks],
        };
    });
};
