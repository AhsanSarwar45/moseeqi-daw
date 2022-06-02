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
import { PartSelectionIndex } from "@Interfaces/Selection";
import { DivisorToDuration } from "@Utility/TimeUtils";
import {
    CreateNote,
    GetPartNote,
    IsNoteInPart,
    MakeNotePartRelative,
    MoveNote,
    PlayNote,
} from "@Utility/NoteUtils";
import {
    CreatePart,
    ExtendPart,
    MapPartTime,
    SetPartTime,
} from "@Utility/PartUtils";
import {
    FindSelectedIndex,
    GetNoteSelectionStartIndex,
    GetPartSelectionStartTime,
} from "@Utility/SelectionUtils";
import { defaultInstrumentIndex, defaultMinPartDuration } from "./Defaults";

interface TrackStoreState {
    tracks: Array<Track>;
    trackCount: number;
    selectedTrackIndex: number;
    selectedPartIndices: Array<PartSelectionIndex>;
    setTracks: (tracks: Array<Track>) => void;
    addTrack: (track: Track) => void;
    addInstrumentTrack: (instrumentIndex: number) => void;
    deleteTrack: (track: Track) => void;
    clearTracks: () => void;
    setSelectedTrack: (track: Track) => void;
    setSelectedTrackIndex: (index: number) => void;
    setSelectedPartsIndices: (
        trackIndex: number,
        partIndex: number,
        isShiftHeld: boolean
    ) => Array<PartSelectionIndex>;
    clearSelectedPartsIndices: () => void;
    addNoteToSelectedTrack: (
        startTime: number,
        row: number,
        divisor: number
    ) => void;
    removeNoteFromSelectedTrack: (partIndex: number, noteIndex: number) => void;
    moveNoteInSelectedTrack: (
        partIndex: number,
        noteIndex: number,
        startTime: number,
        stopTime: number,
        row: number
    ) => void;
    clearSelectedTrack: () => void;
    duplicateSelectedTrack: () => void;
    setSelectedTrackAttack: (attack: number) => void;
    setSelectedTrackRelease: (release: number) => void;
    toggleMuteAtIndex: (trackIndex: number) => void;
    toggleSoloAtIndex: (trackIndex: number) => void;
    moveSelectedParts: (startDelta: number, stopDelta: number) => void;
    setSelectedPartsStartTime: (
        startTime: number,
        selectionOffsets: Array<number>,
        selectionStartIndex: number,
        keepDuration: boolean
    ) => void;

    setSelectedPartsStopTime: (
        stopTime: number,
        selectionOffsets: Array<number>
    ) => void;
}

export const useTracksStore = create<TrackStoreState>()(
    subscribeWithSelector((set) => ({
        tracks: [CreateTrackFromIndex(defaultInstrumentIndex)],
        trackCount: 1,
        selectedTrackIndex: 0,
        selectedPartIndices: [],
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
                StopTrackParts(trackToDelete);
                return {
                    tracks: prev.tracks.filter(
                        (tracks) => tracks.id !== trackToDelete.id
                    ),
                    selectedTrackIndex:
                        prev.selectedTrackIndex > 0
                            ? prev.selectedTrackIndex - 1
                            : 0,
                    selectedPartIndices: [],
                    trackCount: prev.trackCount - 1,
                };
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
            set((prev) => ({ selectedTrackIndex: index }));
        },
        setSelectedPartsIndices: (
            trackIndex: number,
            partIndex: number,
            isShiftHeld: boolean
        ): Array<PartSelectionIndex> => {
            let newSelectedPartIndices: Array<PartSelectionIndex> = [];
            set((prev) => {
                const selectedPartIndex = FindSelectedIndex(
                    prev.selectedPartIndices,
                    trackIndex,
                    partIndex
                );

                newSelectedPartIndices = prev.selectedPartIndices;

                if (isShiftHeld) {
                    // if this part is already selected, deselect it, otherwise select it
                    if (selectedPartIndex >= 0) {
                        let selectedPartIndicesCopy = [
                            ...newSelectedPartIndices,
                        ];
                        selectedPartIndicesCopy.splice(selectedPartIndex, 1);
                        newSelectedPartIndices = selectedPartIndicesCopy;
                    } else {
                        newSelectedPartIndices = [
                            ...newSelectedPartIndices,
                            { trackIndex, partIndex },
                        ];
                    }
                } else {
                    // If selected parts does not contain this part, then reset selected parts to only this part
                    if (selectedPartIndex < 0) {
                        newSelectedPartIndices = [{ trackIndex, partIndex }];
                    }
                }
                return {
                    selectedPartIndices: newSelectedPartIndices,
                };
            });
            return newSelectedPartIndices;
        },
        clearSelectedPartsIndices: () => {
            set((prev) => ({
                selectedPartIndices: [],
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
        removeNoteFromSelectedTrack: (partIndex: number, noteIndex: number) => {
            set((prev) => {
                const tracksCopy = [...prev.tracks];
                const selectedTrack = tracksCopy[prev.selectedTrackIndex];
                const part = selectedTrack.parts[partIndex];

                // Tone doesn't allow us to remove single notes, so we need to clear the part and then re-add all the notes except the removed one
                part.tonePart.clear();
                // Remove the note from the part
                part.notes.splice(noteIndex, 1);
                // Re-add all the notes to the part
                part.notes.forEach((note) => {
                    part.tonePart.add(GetPartNote(note));
                });

                return {
                    tracks: tracksCopy,
                };
            });
        },
        moveNoteInSelectedTrack: (
            partIndex: number,
            noteIndex: number,
            startTime: number,
            stopTime: number,
            row: number
        ) => {
            set((prev) => {
                const tracksCopy = [...prev.tracks];
                const selectedTrack = tracksCopy[prev.selectedTrackIndex];
                const part = selectedTrack.parts[partIndex];
                const note = part.notes[noteIndex];

                MoveNote(note, startTime, stopTime, row);
                // Tone doesn't allow us to modify single notes, so we need to clear the part and then re-add all the notes except the modified one
                part.tonePart.clear();
                // Check if moved position is within the current part
                if (IsNoteInPart(note, part)) {
                    // if the end of the note lies beyond the end of the part, extend the part
                    if (note.stopTime > part.stopTime) {
                        ExtendPart(note, part);
                    }
                    MakeNotePartRelative(note, part);
                } else {
                    // Remove the note from the current part
                    part.notes.splice(noteIndex, 1);
                    AddNoteToTrack(selectedTrack, note);
                }

                // Add back all the notes to the part
                part.notes.forEach((note) => {
                    part.tonePart.add(GetPartNote(note));
                });

                // Play the changed note to give the user feedback
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
        moveSelectedParts: (startDelta: number, stopDelta: number) => {
            set((prev) => {
                const tracksCopy = [...prev.tracks];
                prev.selectedPartIndices.forEach(
                    ({ trackIndex, partIndex }) => {
                        // const part = tracksCopy[trackIndex].parts[partIndex];
                        // MapPartTime(
                        //     part,
                        //     (startTime) => startTime + startDelta,
                        //     (stopTime) => stopTime + stopDelta
                        // );
                        let part = tracksCopy[trackIndex].parts[partIndex];

                        part.startTime += startDelta;
                        part.stopTime += stopDelta;

                        part.tonePart
                            .cancel(0)
                            .start(part.startTime)
                            .stop(part.stopTime);

                        tracksCopy[trackIndex].parts[partIndex] = part;
                        // console.log(part.startTime);/
                    }
                );
                return {
                    tracks: tracksCopy,
                };
            });
        },
        setSelectedPartsStartTime: (
            startTime: number,
            selectionOffsets: Array<number>,
            selectionStartIndex: number,
            keepDuration: boolean = false
        ) => {
            set((prev) => {
                if (startTime - selectionOffsets[selectionStartIndex] < 0) {
                    const delta =
                        selectionOffsets[selectionStartIndex] - startTime;
                    startTime += delta;
                }
                const tracksCopy = [...prev.tracks];
                prev.selectedPartIndices.forEach(
                    ({ trackIndex, partIndex }, index) => {
                        const part = tracksCopy[trackIndex].parts[partIndex];
                        const offset = selectionOffsets[index];
                        // console.log(startTime - offset, stopTime - offset);
                        const partStartTime = startTime - offset;
                        let partStopTime = keepDuration
                            ? partStartTime + part.duration
                            : part.stopTime;
                        partStopTime = Math.max(
                            partStopTime,
                            partStartTime + defaultMinPartDuration
                        );

                        SetPartTime(part, partStartTime, partStopTime);
                    }
                );
                return {
                    tracks: tracksCopy,
                };
            });
        },
        setSelectedPartsStopTime: (
            stopTime: number,
            selectionOffsets: Array<number>
        ) => {
            set((prev) => {
                const tracksCopy = [...prev.tracks];
                prev.selectedPartIndices.forEach(
                    ({ trackIndex, partIndex }, index) => {
                        const part = tracksCopy[trackIndex].parts[partIndex];
                        const offset = selectionOffsets[index];
                        let partStopTime = stopTime - offset;
                        partStopTime = Math.max(
                            partStopTime,
                            part.startTime + defaultMinPartDuration
                        );
                        SetPartTime(part, part.startTime, partStopTime);
                    }
                );
                return {
                    tracks: tracksCopy,
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
export const selectSelectedPartIndices = (state: TrackStoreState) =>
    state.selectedPartIndices;
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
export const selectRemoveNoteFromSelectedTrack = (state: TrackStoreState) =>
    state.removeNoteFromSelectedTrack;
export const selectMoveNoteInSelectedTrack = (state: TrackStoreState) =>
    state.moveNoteInSelectedTrack;
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
export const selectMoveSelectedParts = (state: TrackStoreState) =>
    state.moveSelectedParts;
export const selectSetSelectedPartsIndices = (state: TrackStoreState) =>
    state.setSelectedPartsIndices;
export const selectClearSelectedPartsIndices = (state: TrackStoreState) =>
    state.clearSelectedPartsIndices;
export const selectSetSelectedPartsStartTime = (state: TrackStoreState) =>
    state.setSelectedPartsStartTime;
export const selectSetSelectedPartsStopTime = (state: TrackStoreState) =>
    state.setSelectedPartsStopTime;

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
