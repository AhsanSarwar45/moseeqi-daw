import * as Tone from "tone";

let isAudioContextStarted = false;

export const IsAudioContextStarted = () => isAudioContextStarted;

export const StartAudioContext = async () => {
    await Tone.start();
    isAudioContextStarted = true;
};
