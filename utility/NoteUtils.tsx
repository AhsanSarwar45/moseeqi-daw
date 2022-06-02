import { PianoKeys } from "@Data/Constants";
import { getNoteId } from "@Data/Id";
import { Note } from "@Interfaces/Note";
import { Part } from "@Interfaces/Part";
import { Track } from "@Interfaces/Track";

export const CreateNote = (
    startTime: number,
    duration: number,
    row: number
): Note => {
    return {
        id: getNoteId(),
        startTime: startTime,
        stopTime: startTime + duration,
        keyIndex: row,
        key: PianoKeys[row],
        duration: duration,
        velocity: 1.0,
    };
};

export const MoveNote = (
    note: Note,
    startTime: number,
    stopTime: number,
    row: number
) => {
    note.key = PianoKeys[row];
    note.keyIndex = row;
    note.startTime = startTime;
    note.stopTime = stopTime;
    note.duration = stopTime - startTime;
    return;
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
    track.sampler.triggerAttackRelease(note.key, note.duration);
};

export const IsNoteInPart = (note: Note, part: Part) => {
    return part.startTime <= note.startTime && part.stopTime > note.startTime;
};

export const MakeNotePartRelative = (note: Note, part: Part) => {
    note.startTime -= part.startTime;
    note.stopTime -= part.startTime;
};
