import { InstrumentUrl } from "@interfaces/instrument-url";

export interface Instrument {
    name: string;
    id: string;
    urls: InstrumentUrl;
    release: number;
    attack: number;
}
