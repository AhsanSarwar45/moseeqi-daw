import { Instrument } from "@Interfaces/Instrument";
import { Sampler, Meter } from "tone";
import { Part } from "./Part";

export interface Track {
    readonly id: number;
    readonly name: string;
    readonly instrument: Instrument;
    readonly parts: Array<Part>;
    readonly sampler: Sampler;
    readonly meter: Meter;
    readonly muted: boolean;
    readonly soloed: boolean;
    readonly soloMuted: boolean;
}
