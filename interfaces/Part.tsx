import Tone from "tone";
import { Note } from "./Note";
import { TimeBlock } from "./TimeBlock";
import { TimeBlockContainer } from "./TimeBlockContainer";

export interface Part extends TimeBlock, TimeBlockContainer {
    readonly tonePart: Tone.Part;
}
