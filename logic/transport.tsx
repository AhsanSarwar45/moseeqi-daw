import * as Tone from "tone";
import { synchronizeTone } from "./state";

export const StopTransport = () => {
    Tone.Transport.stop();
    Tone.Transport.seconds = 0;
};

export const StartTransport = () => {
    synchronizeTone();
    Tone.Transport.start();
};

export const PauseTransport = () => {
    Tone.Transport.pause();
};
