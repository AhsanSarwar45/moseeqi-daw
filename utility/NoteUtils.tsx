import { Note } from "@Interfaces/Note";
import { Part } from "@Interfaces/Part";

export const GetPartNote = (note: Note) => {
    const partNote = {
        time: note.startTime,
        note: note.key,
        duration: note.duration,
        velocity: note.velocity,
    };

    return partNote;
};

export const IsNoteInPart = (note: Note, part: Part) => {
    return part.startTime <= note.startTime && part.stopTime > note.startTime;
};

export const MakeNotePartRelative = (note: Note, part: Part) => {
    note.startTime -= part.startTime;
    note.stopTime -= part.startTime;
};
