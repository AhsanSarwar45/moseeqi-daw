import { TimeBlock } from "./TimeBlock";

export interface Note extends TimeBlock {
    id: number;
    keyIndex: number;
    key: string;
    velocity: number;
}
