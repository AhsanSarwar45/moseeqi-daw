import { Id } from "@Types/Types";
import { ChildEntity, ChildTimeBlock } from "./ChildEntity";
import { Part } from "./Part";
import { TimeBlock } from "./TimeBlock";

export interface Note extends ChildTimeBlock {
    readonly key: string;
    readonly velocity: number;
    readonly trackId: Id;
}
