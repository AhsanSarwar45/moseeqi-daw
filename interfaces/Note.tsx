import { TimeBlock } from "./TimeBlock";

export interface Note extends TimeBlock {
    readonly id: number;
    readonly key: string;
    readonly velocity: number;
}
