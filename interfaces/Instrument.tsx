import { InstrumentUrl } from '@Interfaces/InstrumentUrl';

export interface Instrument {
	name: string;
	id: String;
	urls: InstrumentUrl;
	release: number;
	attack: number;
}
