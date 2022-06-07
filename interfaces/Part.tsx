import Tone from "tone";
import { Note } from "./Note";
import { TimeBlock } from "./TimeBlock";

export interface Part extends TimeBlock {
    readonly id: number;
    readonly tonePart: Tone.Part;
    readonly notes: Note[];
}
