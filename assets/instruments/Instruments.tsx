import { AcousticGrandPiano } from "@Instruments/AcousticGrandPiano";
import { AcousticGuitarSteel } from "@Instruments/AcousticGuitarSteel";
import { Clavinet } from "@Instruments/Clavinet";
import { Banjo } from "@Instruments/Banjo";
import { ChurchOrgan } from "@Instruments/ChurchOrgan";
import { Instrument } from "@Interfaces/Instrument";

export const Instruments: Array<Instrument> = [
    {
        name: "Acoustic Grand Piano",
        id: "acousticGrandPiano",
        urls: AcousticGrandPiano,
        release: 1,
        attack: 0,
    },
    {
        name: "Acoustic Guitar Steel",
        id: "acousticGuitarSteel",
        urls: AcousticGuitarSteel,
        release: 1,
        attack: 0,
    },
    { name: "Clavinet", id: "clavinet", urls: Clavinet, release: 1, attack: 0 },
    { name: "Banjo", id: "banjo", urls: Banjo, release: 1, attack: 0 },
    {
        name: "Church Organ",
        id: "churchOrgan",
        urls: ChurchOrgan,
        release: 1,
        attack: 0,
    },
];
