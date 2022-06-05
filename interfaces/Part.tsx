import Tone from "tone";
import { Note } from "./Note";
import { TimeContainer } from "./TimeContainer";

export interface Part extends TimeContainer {
    id: number;
    tonePart: Tone.Part;
    notes: Array<Note>;
}
