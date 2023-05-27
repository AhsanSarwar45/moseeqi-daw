import { Id, NoteMap } from "@types/types";
import Tone from "tone";
import { ChildEntity, ChildTimeBlock } from "./child-entity";

export interface Part extends ChildTimeBlock {
    readonly tonePart: Tone.Part;
    readonly notes: NoteMap;
}
