import create from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

import { Track } from "@Interfaces/Track";
import {
    AddNoteToTrack,
    ClearTrack,
    CopyParts,
    CreateTrack,
    CreateTrackFromIndex,
    SetTrackAttack,
    SetTrackMute,
    SetTrackRelease,
    SetTrackSolo,
    StopTrackParts,
} from "@Utility/TrackUtils";
import { SelectionType, SubSelectionIndex } from "@Interfaces/Selection";
import { BpmToBps, DivisorToDuration } from "@Utility/TimeUtils";
import { CreateNote, GetPartNote, PlayNote } from "@Utility/NoteUtils";
import { IsSelected } from "@Utility/SelectionUtils";
import {
    defaultBPM,
    defaultInstrumentIndex,
    defaultProjectLength,
    defaultProjectName,
} from "./Defaults";
import { initialSecondsPerDivision } from "./Constants";
import { PlaybackState } from "@Interfaces/enums/PlaybackState";

interface StoreState {
    tracks: Array<Track>;
    trackCount: number;
    selectedTrackIndex: number;
    selectedPartIndices: Array<SubSelectionIndex>;
    selectedNoteIndices: Array<SubSelectionIndex>;

    bpm: number;

    projectName: string;
    projectLength: number;

    playbackState: PlaybackState;

    seek: number;

    setTracks: (tracks: Array<Track>) => void;
    addTrack: (track: Track) => void;
    addInstrumentTrack: (instrumentIndex: number) => void;
    clearTracks: () => void;
    setSelectedTrack: (track: Track) => void;
    setSelectedTrackIndex: (index: number) => void;
    addNoteToSelectedTrack: (
        startTime: number,
        row: number,
        divisor: number
    ) => void;
    clearSelectedTrack: () => void;
    duplicateSelectedTrack: () => void;
    setSelectedTrackAttack: (attack: number) => void;
    setSelectedTrackRelease: (release: number) => void;
    toggleMuteAtIndex: (trackIndex: number) => void;
    toggleSoloAtIndex: (trackIndex: number) => void;
    deleteSelectedParts: () => void;
}

export const useStore = create<StoreState>()(
    subscribeWithSelector((set, get) => ({
        tracks: [CreateTrackFromIndex(defaultInstrumentIndex)],
        trackCount: 1,
        selectedTrackIndex: 0,
        selectedPartIndices: [],
        selectedNoteIndices: [],
        bpm: defaultBPM,
        projectName: defaultProjectName,
        projectLength: defaultProjectLength,
        playbackState: PlaybackState.Stopped,
        seek: 0,
        setTracks: (tracksToSet: Array<Track>) =>
            set((prev) => ({ tracks: tracksToSet })),
        addTrack: (trackToAdd: Track) => {
            set((prev) => ({
                tracks: [...prev.tracks, trackToAdd],
                trackCount: prev.trackCount + 1,
            }));
        },
        addInstrumentTrack: (instrumentIndex: number) => {
            set((prev) => ({
                tracks: [...prev.tracks, CreateTrackFromIndex(instrumentIndex)],
                trackCount: prev.trackCount + 1,
            }));
        },

        clearTracks: () => {
            set((prev) => ({
                tracks: [],
                trackCount: 0,
                selectedTrackIndex: 0,
                selectedPartIndices: [],
            }));
        },
        setSelectedTrack: (track: Track) => {
            set((prev) => {
                let tracksCopy = [...prev.tracks];
                tracksCopy[prev.selectedTrackIndex] = track;
                return {
                    tracks: tracksCopy,
                };
            });
        },
        setSelectedTrackIndex: (index: number) => {
            set((prev) => ({
                selectedTrackIndex: index,
                selectedNoteIndices: [],
            }));
        },
        addNoteToSelectedTrack: (
            startTime: number,
            row: number,
            divisor: number
        ) => {
            const duration = DivisorToDuration(divisor);
            const note = CreateNote(startTime, duration, row);
            // Play the note to give the user feedback
            set((prev) => {
                const tracksCopy = [...prev.tracks];
                const selectedTrack = tracksCopy[prev.selectedTrackIndex];
                AddNoteToTrack(selectedTrack, note);
                PlayNote(selectedTrack, note);
                return {
                    tracks: tracksCopy,
                };
            });
        },

        clearSelectedTrack: () => {
            set((prev) => {
                const tracksCopy = [...prev.tracks];
                ClearTrack(tracksCopy[prev.selectedTrackIndex]);
                return {
                    tracks: tracksCopy,
                };
            });
        },
        toggleMuteAtIndex: (trackIndex: number) => {
            set((prev) => {
                const tracksCopy = [...prev.tracks];
                SetTrackMute(
                    tracksCopy[trackIndex],
                    !tracksCopy[trackIndex].muted
                );
                return {
                    tracks: tracksCopy,
                };
            });
        },
        toggleSoloAtIndex: (trackIndex: number) => {
            set((prev) => {
                const tracksCopy = [...prev.tracks];
                SetTrackSolo(
                    tracksCopy[trackIndex],
                    tracksCopy,
                    !tracksCopy[trackIndex].soloed
                );
                return {
                    tracks: tracksCopy,
                };
            });
        },
        duplicateSelectedTrack: () => {
            set((prev) => {
                const tracksCopy = [...prev.tracks];
                const selectedTrack = tracksCopy[prev.selectedTrackIndex];
                const newTrack = CreateTrack(selectedTrack.instrument);
                CopyParts(selectedTrack, newTrack);
                tracksCopy.push(newTrack);

                return {
                    tracks: tracksCopy,
                };
            });
        },
        setSelectedTrackAttack: (attack: number) => {
            set((prev) => {
                const tracksCopy = [...prev.tracks];
                SetTrackAttack(tracksCopy[prev.selectedTrackIndex], attack);
                return {
                    tracks: tracksCopy,
                };
            });
        },
        setSelectedTrackRelease: (release: number) => {
            set((prev) => {
                const tracksCopy = [...prev.tracks];
                SetTrackRelease(tracksCopy[prev.selectedTrackIndex], release);
                return {
                    tracks: tracksCopy,
                };
            });
        },

        deleteSelectedParts: () => {
            set((prev) => {
                return {
                    tracks: prev.tracks.map((track, trackIndex) => {
                        track.parts = track.parts.filter((part, partIndex) => {
                            if (
                                IsSelected(
                                    {
                                        containerIndex: trackIndex,
                                        selectionIndex: partIndex,
                                    },
                                    SelectionType.Part
                                )
                            ) {
                                part.tonePart.cancel(0);
                                return false;
                            }
                            return true;
                        });
                        return track;
                    }),
                    selectedPartIndices: [],
                    selectedNoteIndices: [],
                };
            });
        },
    }))
);

export const selectTracks = (state: StoreState) => state.tracks;
export const selectSelectedTrack = (state: StoreState) =>
    state.tracks[state.selectedTrackIndex];
export const selectTrackCount = (state: StoreState) => state.trackCount;
export const selectSelectedPartIndices = (state: StoreState) =>
    state.selectedPartIndices;
export const selectSelectedNoteIndices = (state: StoreState) =>
    state.selectedNoteIndices;
export const selectSelectedTrackIndex = (state: StoreState) =>
    state.selectedTrackIndex;

export const selectBpm = (state: StoreState) => state.bpm;
export const selectBps = (state: StoreState) => state.bpm / 60;
export const selectCurrentSecondPerDivision = (state: StoreState) =>
    initialSecondsPerDivision / BpmToBps(state.bpm);

export const selectProjectName = (state: StoreState) => state.projectName;
export const selectProjectLength = (state: StoreState) => state.projectLength;

export const selectPlaybackState = (state: StoreState) => state.playbackState;

export const selectSeek = (state: StoreState) => state.seek;

export const selectSetTracks = (state: StoreState) => state.setTracks;
export const selectAddTrack = (state: StoreState) => state.addTrack;
export const selectSetSelectedTrackIndex = (state: StoreState) =>
    state.setSelectedTrackIndex;
export const selectAddInstrumentTrack = (state: StoreState) =>
    state.addInstrumentTrack;
export const selectDuplicateSelectedTrack = (state: StoreState) =>
    state.duplicateSelectedTrack;
export const selectAddNoteToSelectedTrack = (state: StoreState) =>
    state.addNoteToSelectedTrack;
export const selectClearSelectedTrack = (state: StoreState) =>
    state.clearSelectedTrack;
export const selectToggleMuteAtIndex = (state: StoreState) =>
    state.toggleMuteAtIndex;
export const selectToggleSoloAtIndex = (state: StoreState) =>
    state.toggleSoloAtIndex;
export const selectSetSelectedTrackAttack = (state: StoreState) =>
    state.setSelectedTrackAttack;
export const selectSetSelectedTrackRelease = (state: StoreState) =>
    state.setSelectedTrackRelease;
export const selectDeleteSelectedParts = (state: StoreState) =>
    state.deleteSelectedParts;

const MergeSelectors = (state: StoreState, ...selectors: Array<() => any>) => {
    let result = {};
    selectors.forEach((selector) => {
        result = { ...result, ...selector() };
    });
    return result;
};
