import { Id, NoteMap } from "@Types/Types";
import Tone from "tone";
import { ChildEntity, ChildTimeBlock } from "./ChildEntity";
import { Note } from "./Note";
import { TimeBlock } from "./TimeBlock";
import { Track } from "./Track";

export interface Part extends ChildTimeBlock {
    readonly tonePart: Tone.Part | undefined;
    readonly notes: NoteMap;
}
