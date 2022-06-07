import { PianoKeys } from "@Data/Constants";
import { defaultMinPartDuration } from "@Data/Defaults";
import { SetState } from "@Data/SetStoreState";
import { useStore } from "@Data/Store";
import { Note } from "@Interfaces/Note";
import { SelectionType, SubSelectionIndex } from "@Interfaces/Selection";
import { TimeBlock } from "@Interfaces/TimeBlock";
import { Track } from "@Interfaces/Track";
import { Draft } from "immer";
import { isHotkeyPressed } from "react-hotkeys-hook";
import { UpdateNote } from "./NoteUtils";
import { SetPartTime, UpdatePart } from "./PartUtils";
import { SetTimeBlock, SetTimeBlockRowIndex } from "./TimeBlockUtils";
import { GetSelectedTrack } from "./TrackUtils";

export const SetSelectedIndices = (
    selectionType: SelectionType,
    indices: Array<SubSelectionIndex>
) => {
    switch (selectionType) {
        case SelectionType.Part:
            SetState((draftState) => {
                draftState.selectedPartIndices = indices;
            }, "Select part");
            break;
        case SelectionType.Note:
            SetState((draftState) => {
                draftState.selectedNoteIndices = indices;
            }, "Select note");
            break;
        default:
            break;
    }
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
        } else {
            return newSelectedIndices;
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

export const GetTimeBlock = (
    type: SelectionType,
    subSelectionIndex: SubSelectionIndex,
    tracks: Draft<Track>[]
): Draft<TimeBlock> => {
    return type === SelectionType.Part
        ? tracks[subSelectionIndex.containerIndex].parts[
              subSelectionIndex.selectionIndex
          ]
        : tracks[useStore.getState().selectedTrackIndex].parts[
              subSelectionIndex.containerIndex
          ].notes[subSelectionIndex.selectionIndex];
};

export const GetReadonlyTimeBlock = (
    type: SelectionType,
    subSelectionIndex: SubSelectionIndex
): TimeBlock => {
    const tracks = useStore.getState().tracks;
    return type === SelectionType.Part
        ? tracks[subSelectionIndex.containerIndex].parts[
              subSelectionIndex.selectionIndex
          ]
        : tracks[useStore.getState().selectedTrackIndex].parts[
              subSelectionIndex.containerIndex
          ].notes[subSelectionIndex.selectionIndex];
};

export const GetSelectionStartValue = (
    selectedIndices: Array<SubSelectionIndex>,
    type: SelectionType,
    property: "startTime" | "rowIndex"
): number => {
    let selectionStartValue = 100000;

    selectedIndices.forEach((index) => {
        selectionStartValue = Math.min(
            selectionStartValue,
            GetReadonlyTimeBlock(type, index)[property]
        );
    });

    return selectionStartValue;
};

export const GetSelectionStartIndex = (
    selectedIndices: Array<SubSelectionIndex>,
    type: SelectionType,
    property: "startTime" | "rowIndex"
): number => {
    let selectionStartValue = 100000;
    let selectionStartIndex = 0;

    selectedIndices.forEach((selectionIndex, index) => {
        const value = GetReadonlyTimeBlock(type, selectionIndex)[property];
        if (value < selectionStartValue) {
            selectionStartValue = value;
            selectionStartIndex = index;
        }
    });

    return selectionStartIndex;
};

export const GetSelectionOffsets = (
    timeBlock: TimeBlock,
    selectedIndices: Array<SubSelectionIndex>,
    type: SelectionType,
    property: "startTime" | "stopTime" | "rowIndex"
): Array<number> => {
    return selectedIndices.map((index) => {
        return (
            timeBlock[property] - GetReadonlyTimeBlock(type, index)[property]
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
): SubSelectionIndex[] => {
    return type === SelectionType.Part
        ? useStore.getState().selectedPartIndices
        : useStore.getState().selectedNoteIndices;
};

const UpdateTimeObject = (
    selectionType: SelectionType,
    selectionIndex: SubSelectionIndex,
    tracks: Draft<Track>[]
) => {
    if (selectionType === SelectionType.Note) {
        UpdateNote(
            selectionIndex.containerIndex,
            selectionIndex.selectionIndex,
            tracks[useStore.getState().selectedTrackIndex]
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
    SetState((draftState) => {
        const selectedIndices = GetSelectedIndices(selectionType);
        selectedIndices.forEach((subSelectionIndex) => {
            UpdateTimeObject(
                selectionType,
                subSelectionIndex,
                draftState.tracks
            );
        });
    }, `Modify ${SelectionType.toString(selectionType).toLowerCase()}`);
};

export const ClampSelectionStart = (
    value: number,
    offsets: number[],
    startIndex: number
) => {
    const startRowOffset = offsets[startIndex];
    return value - startRowOffset < 0 ? startRowOffset - value : 0;
};

export const DragSelection = (
    newStartTime: number,
    newRowIndex: number,
    offsetsX: Array<number>,
    offsetsY: Array<number>,
    startIndexX: number,
    startIndexY: number,
    selectionType: SelectionType,
    keepDuration: boolean = false
) => {
    SetState(
        (draftState) => {
            SetSelectedStartTime(
                draftState.tracks,
                newStartTime,
                offsetsX,
                startIndexX,
                selectionType,
                keepDuration
            );
            SetSelectionRowIndex(
                draftState.tracks,
                newRowIndex,
                offsetsY,
                startIndexY,
                selectionType
            );
        },
        `Drag ${SelectionType.toString(selectionType).toLowerCase()}`,
        false
    );
};

export const LeftResizeSelection = (
    newStartTime: number,
    offsetsX: Array<number>,
    startIndexX: number,
    selectionType: SelectionType,
    keepDuration: boolean = false
) => {
    SetState(
        (draftState) => {
            SetSelectedStartTime(
                draftState.tracks,
                newStartTime,
                offsetsX,
                startIndexX,
                selectionType,
                keepDuration
            );
        },
        `Resize ${SelectionType.toString(selectionType).toLowerCase()}`,
        false
    );
};

export const RightResizeSelection = (
    newStopTime: number,
    offsetsX: Array<number>,
    selectionType: SelectionType
) => {
    SetState(
        (draftState) => {
            SetSelectedStopTime(
                draftState.tracks,
                newStopTime,
                offsetsX,
                selectionType
            );
        },
        `Resize ${SelectionType.toString(selectionType).toLowerCase()}`,
        false
    );
};

export const ModifySelectedTimeBlocks = (
    tracks: Draft<Track>[],
    newValue: number,
    offsets: number[],
    selectionType: SelectionType,
    recipe: (value: number, timeBlock: Draft<TimeBlock>) => void
) => {
    const selectedIndices = GetSelectedIndices(selectionType);

    selectedIndices.forEach((subSelectionIndex, index) => {
        const timeBlock = GetTimeBlock(
            selectionType,
            subSelectionIndex,
            tracks
        );
        const offset = offsets[index];
        let value = newValue - offset;
        recipe(value, timeBlock);
    });
};

export const SetSelectedStartTime = (
    tracks: Draft<Track>[],
    newStartTime: number,
    offsetsX: Array<number>,
    startIndexX: number,
    selectionType: SelectionType,
    keepDuration: boolean = false
) => {
    const selectedIndices = GetSelectedIndices(selectionType);
    const absoluteSelectionStartTime = GetAbsoluteTime(
        newStartTime,
        selectedIndices[startIndexX],
        selectionType
    );

    newStartTime += ClampSelectionStart(
        absoluteSelectionStartTime,
        offsetsX,
        startIndexX
    );

    ModifySelectedTimeBlocks(
        tracks,
        newStartTime,
        offsetsX,
        selectionType,
        (startTime, timeBlock) => {
            let stopTime = keepDuration
                ? startTime + timeBlock.duration
                : timeBlock.stopTime;
            stopTime = Math.max(stopTime, startTime + defaultMinPartDuration);
            SetTimeBlock(timeBlock, startTime, stopTime);
        }
    );
};
export const SetSelectedStopTime = (
    tracks: Draft<Track>[],
    newStopTime: number,
    offsetsX: Array<number>,
    selectionType: SelectionType
) => {
    ModifySelectedTimeBlocks(
        tracks,
        newStopTime,
        offsetsX,
        selectionType,
        (stopTime, timeBlock) => {
            stopTime = Math.max(
                stopTime,
                timeBlock.startTime + defaultMinPartDuration
            );
            SetTimeBlock(timeBlock, timeBlock.startTime, stopTime);
        }
    );
};

export const SetSelectionRowIndex = (
    tracks: Draft<Track>[],
    newRowIndex: number,
    offsetsY: number[],
    startIndexY: number,
    selectionType: SelectionType
) => {
    newRowIndex += ClampSelectionStart(newRowIndex, offsetsY, startIndexY);
    ModifySelectedTimeBlocks(
        tracks,
        newRowIndex,
        offsetsY,
        selectionType,
        (rowIndex, timeBlock) => {
            SetTimeBlockRowIndex(timeBlock, rowIndex);
        }
    );
};
