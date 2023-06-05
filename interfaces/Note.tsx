import { Id } from "@custom-types/types";
import { ChildEntity, ChildTimeBlock } from "./child-entity";
import { Part } from "./part";
import { TimeBlock } from "./time-block";

export interface Note extends ChildTimeBlock {
    readonly key: string;
    readonly velocity: number;
    readonly trackId: Id;
}
