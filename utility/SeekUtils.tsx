import { IsAudioContextStarted, StartAudioContext } from "@Data/AudioContext";
import { useStore } from "@Data/Store";

export const SetSeek = (seek: number) => {
    if (!IsAudioContextStarted()) StartAudioContext();
    useStore.setState({
        seek: seek,
    });
};
