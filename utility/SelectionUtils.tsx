import { useTracksStore } from "@Data/TracksStore";
import { Note } from "@Interfaces/Note";
import { Part } from "@Interfaces/Part";
import { NoteSelectionIndex, PartSelectionIndex } from "@Interfaces/Selection";

export const FindSelectedIndex = (
    indices: Array<PartSelectionIndex>,
    trackIndex: number,
    partIndex: number
): number => {
    return indices.findIndex(
        (index) =>
            index.trackIndex === trackIndex && index.partIndex === partIndex
    );
};

export const GetPartSelectionStartTime = (
    selectedPartIndices: Array<PartSelectionIndex>
): number => {
    let selectionStartTime = 100000;
    const tracks = useTracksStore.getState().tracks;

    selectedPartIndices.forEach(({ partIndex, trackIndex }) => {
        selectionStartTime = Math.min(
            selectionStartTime,
            tracks[trackIndex].parts[partIndex].startTime
        );
    });

    return selectionStartTime;
};

export const GetPartSelectionStartIndex = (
    selectedPartIndices: Array<PartSelectionIndex>
): number => {
    let selectionStartTime = 100000;
    let selectionIndex = 0;
    const tracks = useTracksStore.getState().tracks;

    selectedPartIndices.forEach(({ partIndex, trackIndex }) => {
        const partStartTime = tracks[trackIndex].parts[partIndex].startTime;
        if (partStartTime < selectionStartTime) {
            selectionStartTime = partStartTime;
            selectionIndex = partIndex;
        }
    });

    return selectionIndex;
};

export const GetPartSelectionStartOffsets = (
    part: Part,
    selectedPartIndices: Array<PartSelectionIndex>
): Array<number> => {
    const tracks = useTracksStore.getState().tracks;

    return selectedPartIndices.map(({ partIndex, trackIndex }) => {
        return part.startTime - tracks[trackIndex].parts[partIndex].startTime;
    });
};

export const GetPartSelectionStopOffsets = (
    part: Part,
    selectedPartIndices: Array<PartSelectionIndex>
): Array<number> => {
    const tracks = useTracksStore.getState().tracks;

    return selectedPartIndices.map(({ partIndex, trackIndex }) => {
        return part.stopTime - tracks[trackIndex].parts[partIndex].stopTime;
    });
};

export const GetNoteSelectionStartIndex = (
    selectedPartIndices: Array<NoteSelectionIndex>
): number => {
    let selectionStartTime = 100000;
    let selectionIndex = 0;
    const tracks = useTracksStore.getState().tracks;
    const selectedTrackIndex = useTracksStore.getState().selectedTrackIndex;
    const selectedTrack = tracks[selectedTrackIndex];

    selectedPartIndices.forEach(({ partIndex, noteIndex }) => {
        const noteStartTime =
            selectedTrack.parts[partIndex].notes[noteIndex].startTime;
        if (noteStartTime < selectionStartTime) {
            selectionStartTime = noteStartTime;
            selectionIndex = partIndex;
        }
    });

    return selectionIndex;
};

export const GetNoteSelectionStartOffsets = (
    note: Note,
    selectedPartIndices: Array<NoteSelectionIndex>
): Array<number> => {
    const tracks = useTracksStore.getState().tracks;
    const selectedTrackIndex = useTracksStore.getState().selectedTrackIndex;
    const selectedTrack = tracks[selectedTrackIndex];

    return selectedPartIndices.map(({ partIndex, noteIndex }) => {
        return (
            note.startTime -
            selectedTrack.parts[partIndex].notes[noteIndex].startTime
        );
    });
};

export const GetNoteSelectionStopOffsets = (
    note: Note,
    selectedPartIndices: Array<NoteSelectionIndex>
): Array<number> => {
    const tracks = useTracksStore.getState().tracks;
    const selectedTrackIndex = useTracksStore.getState().selectedTrackIndex;
    const selectedTrack = tracks[selectedTrackIndex];

    return selectedPartIndices.map(({ partIndex, noteIndex }) => {
        return (
            note.stopTime -
            selectedTrack.parts[partIndex].notes[noteIndex].stopTime
        );
    });
};

export const IsPartSelected = (
    selectedPartIndices: Array<PartSelectionIndex>,
    partIndex: number,
    trackIndex: number
): boolean => {
    return selectedPartIndices.some((partSelectionIndex) => {
        return (
            partSelectionIndex.partIndex === partIndex &&
            partSelectionIndex.trackIndex === trackIndex
        );
    });
};
