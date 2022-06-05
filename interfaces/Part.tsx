import Tone from "tone";
import { Note } from "./Note";
import { TimeBlock } from "./TimeBlock";

export interface Part extends TimeBlock {
    id: number;
    tonePart: Tone.Part;
    notes: Array<Note>;
}
