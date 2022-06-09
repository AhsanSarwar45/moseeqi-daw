import { Instrument } from "@Interfaces/Instrument";
import { Sampler, Meter } from "tone";
import { Part } from "./Part";
import { TimeBlock } from "./TimeBlock";
import { TimeBlockContainer } from "./TimeBlockContainer";

export interface Track extends TimeBlockContainer {
    readonly id: number;
    readonly name: string;
    readonly instrument: Instrument;
    readonly sampler: Sampler;
    readonly meter: Meter;
    readonly muted: boolean;
    readonly soloed: boolean;
    readonly soloMuted: boolean;
}
