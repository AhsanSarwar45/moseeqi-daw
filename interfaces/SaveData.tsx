import { Meter } from "tone";
import { Instrument } from "./Instrument";
import { Part } from "./Part";

export interface TrackSaveData {
    name: string;
    instrument: Instrument;
    parts: Array<Part>;
    muted: boolean;
    soloed: boolean;
    soloMuted: boolean;
}

export interface SaveData {
    tracks: Array<TrackSaveData>;
    bpm: number;
    name: string;
}
