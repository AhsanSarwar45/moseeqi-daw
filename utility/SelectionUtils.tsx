import { defaultMinPartDuration } from "@Data/Defaults";
import { useTracksStore } from "@Data/TracksStore";
import { Note } from "@Interfaces/Note";
import { SelectionType, SubSelectionIndex } from "@Interfaces/Selection";
import { TimeContainer } from "@Interfaces/TimeContainer";
import { Track } from "@Interfaces/Track";
import { isHotkeyPressed } from "react-hotkeys-hook";
import { UpdateNote } from "./NoteUtils";
import { SetPartTime, UpdatePart } from "./PartUtils";
import { SetTimeContainerTime } from "./TimeContainerUtils";
import { GetSelectedTrack } from "./TrackUtils";

export const SetSelectedIndices = (
    selectionType: SelectionType,
    indices: Array<SubSelectionIndex>
) => {
    useTracksStore.setState(
        selectionType === SelectionType.Part
            ? {
                  selectedPartIndices: indices,
              }
            : { selectedNoteIndices: indices }
    );
};

export const Select = (
    containerIndex: number,
    selectionIndex: number,
    selectionType: SelectionType
): Array<SubSelectionIndex> => {
    const selectedIndices = GetSelectedIndices(selectionType);

    const selectedIndex = FindSelectionIndex(
        selectedIndices,
        containerIndex,
        selectionIndex
    );

    let newSelectedIndices = selectedIndices;

    if (isHotkeyPressed("shift")) {
        // if this object is already selected, deselect it, otherwise select it
        if (selectedIndex >= 0) {
            let selectedIndicesCopy = [...newSelectedIndices];
            selectedIndicesCopy.splice(selectedIndex, 1);
            newSelectedIndices = selectedIndicesCopy;
        } else {
            newSelectedIndices = [
                ...newSelectedIndices,
                { containerIndex, selectionIndex },
            ];
        }
    } else {
        // If selection does not contain this object, then reset selected object to only this object
        if (selectedIndex < 0) {
            newSelectedIndices = [{ containerIndex, selectionIndex }];
        }
    }

    // console.log("newSelectedIndices", newSelectedIndices);

    SetSelectedIndices(selectionType, newSelectedIndices);

    return newSelectedIndices;
};

export const FindSelectionIndex = (
    indices: Array<SubSelectionIndex>,
    containerIndex: number,
    selectionIndex: number
): number => {
    return indices.findIndex(
        (index) =>
            index.containerIndex === containerIndex &&
            index.selectionIndex === selectionIndex
    );
};

export const GetSubSelectionTime = (
    type: SelectionType,
    subSelectionIndex: SubSelectionIndex,
    tracks: Array<Track> = useTracksStore.getState().tracks
): TimeContainer => {
    return type === SelectionType.Part
        ? tracks[subSelectionIndex.containerIndex].parts[
              subSelectionIndex.selectionIndex
          ]
        : GetSelectedTrack(tracks).parts[subSelectionIndex.containerIndex]
              .notes[subSelectionIndex.selectionIndex];
};

export const GetSelectionStartTime = (
    selectedIndices: Array<SubSelectionIndex>,
    type: SelectionType
): number => {
    let selectionStartTime = 100000;

    selectedIndices.forEach((index) => {
        selectionStartTime = Math.min(
            selectionStartTime,
            GetSubSelectionTime(type, index).startTime
        );
    });

    return selectionStartTime;
};

export const GetSelectionStartIndex = (
    selectedIndices: Array<SubSelectionIndex>,
    type: SelectionType
): number => {
    let selectionStartTime = 100000;
    let selectionStartIndex = 0;

    selectedIndices.forEach((selectionIndex, index) => {
        const startTime = GetSubSelectionTime(type, selectionIndex).startTime;
        if (startTime < selectionStartTime) {
            selectionStartTime = startTime;
            selectionStartIndex = index;
        }
    });

    return selectionStartIndex;
};

export const GetSelectionTimeOffsets = (
    timeObject: TimeContainer,
    selectedIndices: Array<SubSelectionIndex>,
    type: SelectionType,
    timeMark: "startTime" | "stopTime" = "startTime"
): Array<number> => {
    return selectedIndices.map((index) => {
        return (
            timeObject[timeMark] - GetSubSelectionTime(type, index)[timeMark]
        );
    });
};

export const IsSelected = (
    subSelectionIndex: SubSelectionIndex,
    selectionType: SelectionType
): boolean => {
    const selectedIndices = GetSelectedIndices(selectionType);
    return selectedIndices.some((index) => {
        return (
            index.selectionIndex === subSelectionIndex.selectionIndex &&
            index.containerIndex === subSelectionIndex.containerIndex
        );
    });
};

export const GetSelectedIndices = (
    type: SelectionType
): Array<SubSelectionIndex> => {
    return type === SelectionType.Part
        ? useTracksStore.getState().selectedPartIndices
        : useTracksStore.getState().selectedNoteIndices;
};

const UpdateTimeObject = (
    selectionType: SelectionType,
    selectionIndex: SubSelectionIndex,
    tracks: Array<Track>
) => {
    if (selectionType === SelectionType.Note) {
        UpdateNote(
            selectionIndex.containerIndex,
            selectionIndex.selectionIndex,
            GetSelectedTrack(tracks)
        );
    } else if (selectionType === SelectionType.Part) {
        UpdatePart(
            selectionIndex.containerIndex,
            selectionIndex.selectionIndex,
            tracks
        );
    }
};

export const GetAbsoluteTime = (
    time: number,
    subSelectionIndex: SubSelectionIndex,
    selectionType: SelectionType
) => {
    if (selectionType === SelectionType.Part) {
        return time;
    } else {
        return (
            GetSelectedTrack().parts[subSelectionIndex.containerIndex]
                .startTime + time
        );
    }
};

export const CommitSelectionUpdate = (selectionType: SelectionType) => {
    const tracksCopy = [...useTracksStore.getState().tracks];
    const selectedIndices = GetSelectedIndices(selectionType);
    selectedIndices.forEach((subSelectionIndex) => {
        UpdateTimeObject(selectionType, subSelectionIndex, tracksCopy);
    });
    useTracksStore.setState({ tracks: tracksCopy });
};

export const SetSelectedStartTime = (
    newStartTime: number,
    selectionOffsets: Array<number>,
    selectionStartIndex: number,
    selectionType: SelectionType,
    keepDuration: boolean = false
) => {
    const tracksCopy = [...useTracksStore.getState().tracks];
    const selectedIndices = GetSelectedIndices(selectionType);

    // console.log(newStartTime, selectionOffsets[selectionStartIndex]);
    const absoluteSelectionStartTime = GetAbsoluteTime(
        newStartTime,
        selectedIndices[selectionStartIndex],
        selectionType
    );
    if (
        absoluteSelectionStartTime - selectionOffsets[selectionStartIndex] <
        0
    ) {
        const delta =
            selectionOffsets[selectionStartIndex] - absoluteSelectionStartTime;
        newStartTime += delta;
    }

    // console.log(selectedIndices);

    selectedIndices.forEach((subSelectionIndex, index) => {
        const timeContainer = GetSubSelectionTime(
            selectionType,
            subSelectionIndex,
            tracksCopy
        );

        const offset = selectionOffsets[index];
        let startTime = newStartTime - offset;

        let stopTime = keepDuration
            ? startTime + timeContainer.duration
            : timeContainer.stopTime;
        stopTime = Math.max(stopTime, startTime + defaultMinPartDuration);

        SetTimeContainerTime(timeContainer, startTime, stopTime);

        // UpdateSelection(selectionType, subSelectionIndex, tracksCopy);
    });

    // console.log(tracksCopy);

    useTracksStore.setState({ tracks: tracksCopy });
};
export const SetSelectedStopTime = (
    newStopTime: number,
    selectionOffsets: Array<number>,
    selectionType: SelectionType
) => {
    const tracksCopy = [...useTracksStore.getState().tracks];
    const selectedIndices = GetSelectedIndices(selectionType);

    selectedIndices.forEach((selectionIndex, index) => {
        const timeContainer = GetSubSelectionTime(
            selectionType,
            selectionIndex,
            tracksCopy
        );
        const offset = selectionOffsets[index];
        let stopTime = newStopTime - offset;
        stopTime = Math.max(
            stopTime,
            timeContainer.startTime + defaultMinPartDuration
        );
        SetTimeContainerTime(timeContainer, timeContainer.startTime, stopTime);
    });

    useTracksStore.setState({ tracks: tracksCopy });
};
