import { Instrument } from "./Instrument";
import { Note } from "./Note";
import { Part } from "./Part";
import { TimeBlock } from "./TimeBlock";

export interface PartSaveData extends TimeBlock {
    notes: Array<Note>;
}

export interface TrackSaveData {
    name: string;
    instrument: Instrument;
    parts: Array<PartSaveData>;
    muted: boolean;
    soloed: boolean;
    soloMuted: boolean;
}

export interface SaveData {
    tracks: Array<TrackSaveData>;
    bpm: number;
    name: string;
}
