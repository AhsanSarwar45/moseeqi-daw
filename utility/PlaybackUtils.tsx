import { IsAudioContextStarted, StartAudioContext } from "@Data/AudioContext";
import { useStore } from "@Data/Store";
import { PlaybackState } from "@Interfaces/enums/PlaybackState";

export const SetPlaybackState = (playbackState: PlaybackState) => {
    if (!IsAudioContextStarted()) StartAudioContext();
    useStore.setState({
        playbackState: playbackState,
    });
};

export const TogglePlayback = () => {
    if (!IsAudioContextStarted()) StartAudioContext();
    const prevPlaybackState = useStore.getState().playbackState;

    useStore.setState({
        playbackState:
            prevPlaybackState === PlaybackState.Playing
                ? PlaybackState.Paused
                : prevPlaybackState === PlaybackState.Paused
                ? PlaybackState.Playing
                : PlaybackState.Stopped,
    });
};
