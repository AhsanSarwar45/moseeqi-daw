import { PianoKeys } from "@Data/Constants";
import { defaultMinPartDuration } from "@Data/Defaults";
import { SetState, StoreState } from "@Data/Store";
import { useStore } from "@Data/Store";
import { BoxBounds } from "@Interfaces/Box";
import { Note } from "@Interfaces/Note";
import { SelectionType, SubSelectionIndex } from "@Interfaces/Selection";
import { TimeBlock } from "@Interfaces/TimeBlock";
import { TimeBlockContainer } from "@Interfaces/TimeBlockContainer";
import { Track } from "@Interfaces/Track";
import { Draft } from "immer";
import { isHotkeyPressed } from "react-hotkeys-hook";
import { UpdateNote } from "./NoteUtils";
import { SetPartTime, UpdatePart } from "./PartUtils";
import {
    GetTimeBlockBounds,
    SetTimeBlock,
    SetTimeBlockRowIndex,
} from "./TimeBlockUtils";
import { GetSelectedTrack } from "./TrackUtils";

export const SetSelectedIndices = (
    selectionType: SelectionType,
    indices: SubSelectionIndex[]
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
    }
};

export const Select = (
    containerIndex: number,
    subContainerIndex: number,
    selectionType: SelectionType
): SubSelectionIndex[] => {
    const selectedIndices = GetSelectedIndices(selectionType);

    const selectedIndex = FindSelectionIndex(
        selectedIndices,
        containerIndex,
        subContainerIndex
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
                { containerIndex, subContainerIndex },
            ];
        }
    } else {
        // If selection does not contain this object, then reset selected object to only this object
        if (selectedIndex < 0) {
            newSelectedIndices = [{ containerIndex, subContainerIndex }];
        } else {
            return newSelectedIndices;
        }
    }

    SetSelectedIndices(selectionType, newSelectedIndices);

    return newSelectedIndices;
};
const DoBoxesIntersect = (a: BoxBounds, b: BoxBounds) => {
    return (
        Math.abs(a.left + a.width / 2 - (b.left + b.width / 2)) * 2 <
            a.width + b.width &&
        Math.abs(a.top + a.height / 2 - (b.top + b.height / 2)) * 2 <
            a.height + b.height
    );
};

export const GetContainer = (
    selectionType: SelectionType
): TimeBlockContainer[] => {
    switch (selectionType) {
        case SelectionType.Part:
            return useStore.getState().tracks;
        case SelectionType.Note:
            return GetSelectedTrack().timeBlocks;
        default:
            return [];
    }
};

export const GetSubContainer = (
    selectionType: SelectionType,
    container: any
): TimeBlock[] => {
    switch (selectionType) {
        case SelectionType.Part:
            return container.parts;
        case SelectionType.Note:
            return container.notes;
        default:
            return [];
    }
};

export const DragSelect = (
    selectionBounds: BoxBounds,
    pixelsPerSecond: number,
    pixelsPerRow: number,
    selectionType: SelectionType
) => {
    const selectedIndices: SubSelectionIndex[] = [];
    const containers = GetContainer(selectionType);
    containers?.forEach((container, containerIndex) => {
        const subContainer = GetSubContainer(selectionType, container);
        subContainer.forEach((timeBlock: TimeBlock, subContainerIndex) => {
            const noteBounds = GetTimeBlockBounds(
                timeBlock,
                pixelsPerSecond,
                pixelsPerRow
            );
            if (DoBoxesIntersect(selectionBounds, noteBounds)) {
                selectedIndices.push({
                    containerIndex: containerIndex,
                    subContainerIndex: subContainerIndex,
                });
            }
        });
    });
    // console.log(selectionType, selectedIndices);
    SetSelectedIndices(selectionType, selectedIndices);
};

export const FindSelectionIndex = (
    indices: SubSelectionIndex[],
    containerIndex: number,
    selectionIndex: number
): number => {
    return indices.findIndex(
        (index) =>
            index.containerIndex === containerIndex &&
            index.subContainerIndex === selectionIndex
    );
};

export const GetTimeBlock = (
    type: SelectionType,
    subSelectionIndex: SubSelectionIndex,
    tracks: Draft<Track>[]
): Draft<TimeBlock> => {
    return type === SelectionType.Part
        ? tracks[subSelectionIndex.containerIndex].parts[
              subSelectionIndex.subContainerIndex
          ]
        : tracks[useStore.getState().selectedTrackIndex].parts[
              subSelectionIndex.containerIndex
          ].notes[subSelectionIndex.subContainerIndex];
};

export const GetReadonlyTimeBlock = (
    type: SelectionType,
    subSelectionIndex: SubSelectionIndex
): TimeBlock => {
    const tracks = useStore.getState().tracks;
    return type === SelectionType.Part
        ? tracks[subSelectionIndex.containerIndex].parts[
              subSelectionIndex.subContainerIndex
          ]
        : tracks[useStore.getState().selectedTrackIndex].parts[
              subSelectionIndex.containerIndex
          ].notes[subSelectionIndex.subContainerIndex];
};

export const GetSelectionStartValue = (
    selectedIndices: SubSelectionIndex[],
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
    selectedIndices: SubSelectionIndex[],
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
    selectedIndices: SubSelectionIndex[],
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
            index.subContainerIndex === subSelectionIndex.subContainerIndex &&
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
        const selectedTrackIndex = useStore.getState().selectedTrackIndex;
        UpdateNote(
            selectionIndex.containerIndex,
            selectionIndex.subContainerIndex,
            tracks[selectedTrackIndex]
        );
    } else if (selectionType === SelectionType.Part) {
        UpdatePart(
            selectionIndex.containerIndex,
            selectionIndex.subContainerIndex,
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
