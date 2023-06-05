import { Id } from "@custom-types/types";
import { TimeBlock } from "./time-block";

export interface ChildEntity {
    readonly parentId: Id;
}

export type ChildTimeBlock = ChildEntity & TimeBlock;
