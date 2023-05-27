import * as Tone from "tone";

import { Instrument } from "@interfaces/instrument";

const CreateSampler = (instrument: Instrument, onLoad: () => void) => {
    return new Tone.Sampler({
        urls: instrument.urls as any,
        release: instrument.release,
        attack: instrument.attack,
        onload: onLoad,
    });
};

export default CreateSampler;
