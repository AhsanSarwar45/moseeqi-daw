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
import { DivisorToDuration } from "@Utility/TimeUtils";
import { CreateNote, GetPartNote, PlayNote } from "@Utility/NoteUtils";
import { IsSelected } from "@Utility/SelectionUtils";
import { defaultInstrumentIndex } from "./Defaults";

interface TrackStoreState {
    tracks: Array<Track>;
    trackCount: number;
    selectedTrackIndex: number;
    selectedPartIndices: Array<SubSelectionIndex>;
    selectedNoteIndices: Array<SubSelectionIndex>;
    setTracks: (tracks: Array<Track>) => void;
    addTrack: (track: Track) => void;
    addInstrumentTrack: (instrumentIndex: number) => void;
    deleteTrack: (track: Track) => void;
    deleteSelectedTrack: () => void;
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

const DeleteTrack = (trackToDelete: Track, prev: TrackStoreState) => {
    StopTrackParts(trackToDelete);
    return {
        tracks: prev.tracks.filter((tracks) => tracks.id !== trackToDelete.id),
        selectedTrackIndex:
            prev.selectedTrackIndex > 0 ? prev.selectedTrackIndex - 1 : 0,
        selectedPartIndices: [],
        selectedNoteIndices: [],
        trackCount: prev.trackCount - 1,
    };
};

export const useTracksStore = create<TrackStoreState>()(
    subscribeWithSelector((set, get) => ({
        tracks: [CreateTrackFromIndex(defaultInstrumentIndex)],
        trackCount: 1,
        selectedTrackIndex: 0,
        selectedPartIndices: [],
        selectedNoteIndices: [],
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
        deleteTrack: (trackToDelete: Track) =>
            set((prev) => {
                if (prev.tracks.length == 0) return prev;
                return DeleteTrack(trackToDelete, prev);
            }),
        deleteSelectedTrack: () =>
            set((prev) => {
                if (prev.tracks.length == 0) return prev;
                const selectedTrack = prev.tracks[prev.selectedTrackIndex];
                return DeleteTrack(selectedTrack, prev);
            }),
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

export const selectTracks = (state: TrackStoreState) => state.tracks;
export const selectSelectedTrack = (state: TrackStoreState) =>
    state.tracks[state.selectedTrackIndex];
export const selectTrackCount = (state: TrackStoreState) => state.trackCount;
export const selectSetTracks = (state: TrackStoreState) => state.setTracks;
export const selectAddTrack = (state: TrackStoreState) => state.addTrack;
export const selectDeleteTrack = (state: TrackStoreState) => state.deleteTrack;
export const selectDeleteSelectedTrack = (state: TrackStoreState) =>
    state.deleteSelectedTrack;

export const selectSelectedPartIndices = (state: TrackStoreState) =>
    state.selectedPartIndices;
export const selectSelectedNoteIndices = (state: TrackStoreState) =>
    state.selectedNoteIndices;
export const selectSelectedTrackIndex = (state: TrackStoreState) =>
    state.selectedTrackIndex;
export const selectSetSelectedTrackIndex = (state: TrackStoreState) =>
    state.setSelectedTrackIndex;
export const selectAddInstrumentTrack = (state: TrackStoreState) =>
    state.addInstrumentTrack;
export const selectDuplicateSelectedTrack = (state: TrackStoreState) =>
    state.duplicateSelectedTrack;
export const selectAddNoteToSelectedTrack = (state: TrackStoreState) =>
    state.addNoteToSelectedTrack;
export const selectClearSelectedTrack = (state: TrackStoreState) =>
    state.clearSelectedTrack;
export const selectToggleMuteAtIndex = (state: TrackStoreState) =>
    state.toggleMuteAtIndex;
export const selectToggleSoloAtIndex = (state: TrackStoreState) =>
    state.toggleSoloAtIndex;
export const selectSetSelectedTrackAttack = (state: TrackStoreState) =>
    state.setSelectedTrackAttack;
export const selectSetSelectedTrackRelease = (state: TrackStoreState) =>
    state.setSelectedTrackRelease;
export const selectDeleteSelectedParts = (state: TrackStoreState) =>
    state.deleteSelectedParts;

const MergeSelectors = (
    state: TrackStoreState,
    ...selectors: Array<() => any>
) => {
    let result = {};
    selectors.forEach((selector) => {
        result = { ...result, ...selector() };
    });
    return result;
};
