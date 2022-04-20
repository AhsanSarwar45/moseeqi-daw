import { Instrument } from '@Interfaces/Instrument';
import { Note } from '@Interfaces/Note';

import { Sampler, Meter } from 'tone';

export interface Track {
	name: string;
	instrument: Instrument;
	notes: Array<Note>;
	sampler: Sampler;
	meter: Meter;
	muted: boolean;
}
