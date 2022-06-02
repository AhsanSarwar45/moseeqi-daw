import { useTracksStore } from "@Data/TracksStore";
import { Part } from "@Interfaces/Part";
import { PartSelectionIndex } from "@Interfaces/Selection";

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

export const GetSelectionStartTime = (
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

export const GetSelectionStartIndex = (
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

export const GetSelectionOffsets = (
    part: Part,
    selectedPartIndices: Array<PartSelectionIndex>
): Array<number> => {
    const tracks = useTracksStore.getState().tracks;

    return selectedPartIndices.map(({ partIndex, trackIndex }) => {
        return part.startTime - tracks[trackIndex].parts[partIndex].startTime;
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
