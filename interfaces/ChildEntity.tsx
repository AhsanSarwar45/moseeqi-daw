import { Id } from "@Types/Types";
import { TimeBlock } from "./TimeBlock";

export interface ChildEntity {
    readonly parentId: Id;
}

export type ChildTimeBlock = ChildEntity & TimeBlock;
