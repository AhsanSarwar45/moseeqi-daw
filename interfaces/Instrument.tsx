import { InstrumentUrl } from "@Interfaces/InstrumentUrl";

export interface Instrument {
    name: string;
    id: string;
    urls: InstrumentUrl;
    release: number;
    attack: number;
}
