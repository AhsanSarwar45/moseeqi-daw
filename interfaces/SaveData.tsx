import { Instrument } from "./Instrument";
import { Note } from "./Note";
import { Part } from "./Part";
import { TimeBlock } from "./TimeBlock";

// All fields must me JSON serializable, and composed only of POD types (string, number, boolean)

export interface NoteSaveData extends TimeBlock {
    readonly key: string;
    readonly velocity: number;
}

export interface PartSaveData extends TimeBlock {
    notes: Array<NoteSaveData>;
}

export interface TrackSaveData {
    name: string;
    instrument: Instrument;
    parts: Array<PartSaveData>;
    muted: boolean;
    soloed: boolean;
    soloMuted: boolean;
}

export interface ProjectSaveData {
    tracks: Array<TrackSaveData>;
    bpm: number;
    projectName: string;
    projectLength: number;
}
