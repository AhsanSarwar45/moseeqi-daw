import { Instrument } from "@Interfaces/Instrument";
import { Container, PartMap } from "@Types/Types";
import { Sampler, Meter } from "tone";
import { Part } from "./Part";

export interface Track {
    readonly name: string;
    readonly instrument: Instrument;
    readonly parts: PartMap;
    readonly sampler: Sampler;
    readonly meter: Meter;
    readonly muted: boolean;
    readonly soloed: boolean;
    readonly soloMuted: boolean;
}
