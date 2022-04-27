import Tone from 'tone';
import { Note } from './Note';

export interface Part {
    tonePart: Tone.Part;
    notes: Array<Note>;
    startTime: number;
    stopTime: number;
}