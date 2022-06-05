import { TimeContainer } from "./TimeContainer";

export interface Note extends TimeContainer {
    id: number;
    keyIndex: number;
    key: string;
    velocity: number;
}
