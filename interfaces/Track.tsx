import { Instrument } from "@interfaces/instrument";
import { Part } from "@interfaces/part";
import { Container, PartMap } from "@custom-types/types";
import { Sampler, Meter } from "tone";

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
