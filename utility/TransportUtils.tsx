import * as Tone from "tone";

export const StopTransport = () => {
    Tone.Transport.stop();
    Tone.Transport.seconds = 0;
};

export const StartTransport = () => {
    Tone.Transport.start();
};

export const PauseTransport = () => {
    Tone.Transport.pause();
};
