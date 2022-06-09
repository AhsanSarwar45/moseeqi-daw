import { TimeBlock } from "./TimeBlock";

export interface Note extends TimeBlock {
    readonly key: string;
    readonly velocity: number;
}
