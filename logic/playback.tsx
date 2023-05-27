import { IsAudioContextStarted, StartAudioContext } from "@data/audio-context";
import { usePlaybackStore } from "@data/stores/playback";
import { useStore } from "@data/stores/project";
import { PlaybackState } from "@interfaces/enums/playback-state";

export const setSeek = (seek: number) => {
    if (!IsAudioContextStarted()) StartAudioContext();
    usePlaybackStore.setState({
        seek: seek,
    });
};

export const setPlaybackState = (playbackState: PlaybackState) => {
    if (!IsAudioContextStarted()) StartAudioContext();
    usePlaybackStore.setState({
        playbackState: playbackState,
    });
};

export const togglePlayback = () => {
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
