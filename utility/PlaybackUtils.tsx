import { IsAudioContextStarted, StartAudioContext } from "@Data/AudioContext";
import { usePlaybackStore } from "@Data/PlaybackStore";
import { useStore } from "@Data/Store";
import { PlaybackState } from "@Interfaces/enums/PlaybackState";

export const SetSeek = (seek: number) => {
    if (!IsAudioContextStarted()) StartAudioContext();
    usePlaybackStore.setState({
        seek: seek,
    });
};

export const SetPlaybackState = (playbackState: PlaybackState) => {
    if (!IsAudioContextStarted()) StartAudioContext();
    usePlaybackStore.setState({
        playbackState: playbackState,
    });
};

export const TogglePlayback = () => {
    if (!IsAudioContextStarted()) StartAudioContext();
    usePlaybackStore.setState((prev) => {
        let nextPlaybackState = PlaybackState.Stopped;
        if (prev.playbackState === PlaybackState.Playing) {
            nextPlaybackState = PlaybackState.Paused;
        } else if (prev.playbackState === PlaybackState.Paused) {
            nextPlaybackState = PlaybackState.Playing;
        } else if (prev.playbackState === PlaybackState.Stopped) {
            nextPlaybackState = PlaybackState.Playing;
        }
        return {
            playbackState: nextPlaybackState,
        };
    });
};
