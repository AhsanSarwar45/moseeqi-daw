import { Instrument } from "@Interfaces/Instrument";
import { Sampler, Meter } from "tone";
import { Part } from "./Part";

export interface Track {
    name: string;
    instrument: Instrument;
    parts: Array<Part>;
    sampler: Sampler;
    meter: Meter;
    muted: boolean;
}
