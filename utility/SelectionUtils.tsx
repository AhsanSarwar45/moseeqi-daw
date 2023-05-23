import { Draft } from "immer";
import { isHotkeyPressed } from "react-hotkeys-hook";
import _ from "lodash";

import { PianoKeys } from "@Data/Constants";
import { defaultMinPartDuration } from "@Data/Defaults";
import { getState, setState, StoreState } from "@Data/Store";
import { useStore } from "@Data/Store";
import { BoxBounds } from "@Interfaces/Box";
import { ChildTimeBlock } from "@Interfaces/ChildEntity";
import { Note } from "@Interfaces/Note";
import { Part } from "@Interfaces/Part";
import {
    SelectionType,
    SelectionSubId,
    SelectionId,
} from "@Interfaces/Selection";
import { TimeBlock } from "@Interfaces/TimeBlock";
import { Track } from "@Interfaces/Track";
import {
    ChildTimeBlockMap,
    ChildTimeBlockRecord,
    Container,
    ContainerMap,
    EntityMap,
    Id,
    NoteRecord,
    PartRecord,
    TimeBlockRecord,
    TrackMap,
} from "@Types/Types";
import { UpdateNote } from "./NoteUtils";
import { SetPartTime, UpdatePart } from "./PartUtils";
import {
    GetTimeBlockBounds,
    SetTimeBlock,
    SetTimeBlockRowIndex,
} from "./TimeBlockUtils";
import { GetLastSelectedTrackConst, GetSelectedTrack } from "./TrackUtils";

export const SetSelectedIndices = (
    selectedIds: Draft<SelectionId>[],
    selectionType: SelectionType,
    draftState: Draft<StoreState>
) => {
    switch (selectionType) {
        case SelectionType.Part:
            draftState.selectedPartsId = selectedIds as SelectionSubId[];
            break;
        case SelectionType.Note:
            draftState.selectedNotesId = selectedIds as SelectionSubId[];
            break;
        case SelectionType.Track:
            draftState.selectedTracksId = selectedIds as Id[];
    }
};

export const GetTimeBlockSelectionId = ([
    timeBlockId,
    timeBlock,
]: ChildTimeBlockRecord): SelectionSubId => {
    return { containerId: timeBlock.parentId, entityId: timeBlockId };
};

export const SelectTimeBlock = (
    timeBlockRecord: ChildTimeBlockRecord,
    selectionType: SelectionType
) => {
    const selectionId = GetTimeBlockSelectionId(timeBlockRecord);
    Select(selectionId, selectionType);
};

export const Select = (id: SelectionId, selectionType: SelectionType) => {
    setState((draftState) => {
        let selectedIds = GetSelectedIds(selectionType);
        const isIdSelected = IsIdSelected(id, selectedIds);

        if (isHotkeyPressed("shift")) {
            // if this object is already selected, deselect it, otherwise select it
            if (isIdSelected) {
                selectedIds = selectedIds.filter((selectedId) => {
                    selectedId !== id;
                });
            } else {
                selectedIds.push(id);
            }
        } else {
            // If selection does not contain this object, then reset selected object to only this object
            if (!isIdSelected) {
                selectedIds = [id];
            }
        }
        SetSelectedIndices(selectedIds, selectionType, draftState);
    }, `Select ${SelectionType.toString(selectionType).toLowerCase()}`);
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
    selectionType: SelectionType,
    draftState: Draft<StoreState> = getState()
): Draft<ContainerMap> => {
    if (selectionType === SelectionType.Part) return draftState.tracks;
    else return GetSelectedTrack(draftState).parts;
};

export const GetSubContainer = (
    selectionType: SelectionType,
    container: Draft<Container>
): Draft<ChildTimeBlockMap> => {
    if (selectionType === SelectionType.Part)
        return (container as Draft<Track>).parts;
    else return (container as Draft<Part>).notes;
};

export const GetAbsoluteTimeBlock = (
    timeBlock: ChildTimeBlock,
    selectionType: SelectionType
): TimeBlock => {
    if (selectionType === SelectionType.Note) {
        const part = GetContainer(selectionType).get(
            timeBlock.parentId
        ) as Draft<Part>;
        return {
            ...timeBlock,
            startTime: part.startTime + timeBlock.startTime,
            stopTime: part.startTime + timeBlock.stopTime,
        };
    }
    return { ...timeBlock };
};

export const GetChildTimeBlockRecords = (
    selectionType: SelectionType,
    draftState: Draft<StoreState> = getState()
): ChildTimeBlockRecord[] => {
    const timeBlocksRecords: ChildTimeBlockRecord[] = [];
    const containers = GetContainer(selectionType, draftState);
    Array.from(containers.entries()).forEach(([containerId, container]) => {
        const subContainer = GetSubContainer(selectionType, container);
        Array.from(subContainer.entries()).forEach((timeBlockRecord) => {
            timeBlocksRecords.push(timeBlockRecord);
        });
    });
    return timeBlocksRecords;
};

export const DragSelectTimeBlocks = (
    selectionBounds: BoxBounds,
    pixelsPerSecond: number,
    pixelsPerRow: number,
    selectionType: SelectionType
) => {
    setState((draftState) => {
        const selectedIds: SelectionSubId[] = [];
        const timeBlockRecords = GetChildTimeBlockRecords(
            selectionType,
            draftState
        );
        timeBlockRecords.forEach(([entityId, timeBlock]) => {
            const absoluteTimeBlock = GetAbsoluteTimeBlock(
                timeBlock,
                selectionType
            );
            const noteBounds = GetTimeBlockBounds(
                absoluteTimeBlock,
                pixelsPerSecond,
                pixelsPerRow
            );
            if (DoBoxesIntersect(selectionBounds, noteBounds)) {
                selectedIds.push({ containerId: timeBlock.parentId, entityId });
            }
        });
    }, `Drag select ${SelectionType.toString(selectionType).toLowerCase()}`);
};

export const IsIdSelected = (
    id: SelectionId,
    selectedIds: SelectionId[]
): boolean => {
    return selectedIds.some((selectedId) => {
        return _.isEqual(selectedId, id);
    });
};

export const IsTimeBlockSelected = (
    timeBlockRecord: ChildTimeBlockRecord,
    selectedIds: SelectionId[]
): boolean => {
    const selectionId = GetTimeBlockSelectionId(timeBlockRecord);
    return IsIdSelected(selectionId, selectedIds);
};

// export const GetTimeBlock = (
//     type: SelectionType,
//     subSelectionIndex: SubSelectionIndex,
//     tracks: Draft<Track>[]
// ): Draft<TimeBlock> => {
//     return type === SelectionType.Part
//         ? tracks[subSelectionIndex.containerIndex].parts[
//               subSelectionIndex.subContainerIndex
//           ]
//         : tracks[useStore.getState().selectedTrackIndex].parts[
//               subSelectionIndex.containerIndex
//           ].notes[subSelectionIndex.subContainerIndex];
// };

export const GetEntityFromId = (
    { containerId, entityId }: SelectionSubId,
    selectionType: SelectionType,
    draftState: Draft<StoreState> = getState()
): Draft<ChildTimeBlock> => {
    const containers = GetContainer(selectionType, draftState);
    const container = containers.get(containerId) as Draft<Container>;
    const subContainer = GetSubContainer(selectionType, container);
    return subContainer.get(entityId) as Draft<ChildTimeBlock>;
};

export const GetSelectionStartValue = (
    selectionType: SelectionType,
    property: "startTime" | "rowIndex"
): number => {
    let selectionStartValue = 100000;
    const selectedIds = GetSelectedIds(selectionType) as SelectionSubId[];
    selectedIds.forEach((selectedId) => {
        const entity = GetEntityFromId(selectedId, selectionType);
        selectionStartValue = Math.min(selectionStartValue, entity[property]);
    });
    return selectionStartValue;
};

export const GetSelectionStartIndex = (
    selectionType: SelectionType,
    property: "startTime" | "rowIndex"
): number => {
    let selectionStartValue = 100000;
    let selectionStartIndex = 0;
    const selectedIds = GetSelectedIds(selectionType) as SelectionSubId[];
    selectedIds.forEach((selectedId, index) => {
        const entity = GetEntityFromId(selectedId, selectionType);
        const value = entity[property];
        if (value < selectionStartValue) {
            selectionStartValue = value;
            selectionStartIndex = index;
        }
    });
    return selectionStartIndex;
};

export const GetSelectionOffsets = (
    timeBlock: TimeBlock,
    selectionType: SelectionType,
    property: "startTime" | "stopTime" | "rowIndex"
): Array<number> => {
    const selectedIds = GetSelectedIds(selectionType) as SelectionSubId[];
    console.log(selectedIds);
    return selectedIds.map((selectedId) => {
        const entity = GetEntityFromId(selectedId, selectionType);
        return timeBlock[property] - entity[property];
    });
};

export const GetSelectedIds = (
    selectionType: SelectionType,
    draftState: Draft<StoreState> = useStore.getState()
): Draft<SelectionId>[] => {
    switch (selectionType) {
        case SelectionType.Part:
            return draftState.selectedPartsId;
        case SelectionType.Note:
            return draftState.selectedNotesId;
        case SelectionType.Track:
            return draftState.selectedTracksId;
        default:
            return [];
    }
};

const UpdateTimeObject = (
    entity: ChildTimeBlockRecord,
    tracks: Draft<TrackMap>,
    selectionType: SelectionType
) => {
    if (selectionType === SelectionType.Note) {
        UpdateNote(entity as NoteRecord, tracks);
    } else if (selectionType === SelectionType.Part) {
        UpdatePart(entity as PartRecord);
    }
};

// export const GetAbsoluteTime = (
//     time: number,
//     entity: TimeBlockEntity,
//     selectionType: SelectionType
// ): number => {
//     if (selectionType === SelectionType.Note) {
//         const parentPart = (entity as Note).parentPart as Part;
//         return parentPart.startTime + time;
//     }
//     return time;
// };

export const CommitSelectionUpdate = (selectionType: SelectionType) => {
    setState((draftState) => {
        const selectedIds = GetSelectedIds(
            selectionType,
            draftState
        ) as SelectionSubId[];
        selectedIds.forEach((selectedId) => {
            const timeObject = GetEntityFromId(
                selectedId,
                selectionType,
                draftState
            );
            UpdateTimeObject(
                [selectedId.entityId, timeObject],
                draftState.tracks,
                selectionType
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
    setState(
        (draftState) => {
            SetSelectedStartTime(
                newStartTime,
                offsetsX,
                startIndexX,
                selectionType,
                draftState,
                keepDuration
            );
            SetSelectionRowIndex(
                newRowIndex,
                offsetsY,
                startIndexY,
                selectionType,
                draftState
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
    setState(
        (draftState) => {
            SetSelectedStartTime(
                newStartTime,
                offsetsX,
                startIndexX,
                selectionType,
                draftState,
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
    setState(
        (draftState) => {
            SetSelectedStopTime(
                newStopTime,
                offsetsX,
                selectionType,
                draftState
            );
        },
        `Resize ${SelectionType.toString(selectionType).toLowerCase()}`,
        false
    );
};

export const ModifySelectedTimeBlocks = (
    newValue: number,
    offsets: number[],
    selectionType: SelectionType,
    draftState: Draft<StoreState>,
    recipe: (value: number, timeBlock: Draft<ChildTimeBlock>) => void
) => {
    const selectedIds = GetSelectedIds(selectionType) as SelectionSubId[];
    selectedIds.forEach((selectedId, index) => {
        const offset = offsets[index];
        let value = newValue - offset;
        const entity = GetEntityFromId(selectedId, selectionType, draftState);
        recipe(value, entity);
    });
};

export const SetSelectedStartTime = (
    newStartTime: number,
    offsetsX: number[],
    startIndexX: number,
    selectionType: SelectionType,
    draftState: Draft<StoreState>,
    keepDuration: boolean = false
) => {
    const selectedIds = GetSelectedIds(selectionType) as SelectionSubId[];
    const startEntity = GetEntityFromId(
        selectedIds[startIndexX],
        selectionType
    );
    const absoluteSelectionStartTime = GetAbsoluteTimeBlock(
        startEntity,
        selectionType
    ).startTime;

    newStartTime += ClampSelectionStart(
        absoluteSelectionStartTime,
        offsetsX,
        startIndexX
    );

    ModifySelectedTimeBlocks(
        newStartTime,
        offsetsX,
        selectionType,
        draftState,
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
    newStopTime: number,
    offsetsX: Array<number>,
    selectionType: SelectionType,
    draftState: Draft<StoreState>
) => {
    ModifySelectedTimeBlocks(
        newStopTime,
        offsetsX,
        selectionType,
        draftState,
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
    newRowIndex: number,
    offsetsY: number[],
    startIndexY: number,
    selectionType: SelectionType,
    draftState: Draft<StoreState>
) => {
    newRowIndex += ClampSelectionStart(newRowIndex, offsetsY, startIndexY);
    ModifySelectedTimeBlocks(
        newRowIndex,
        offsetsY,
        selectionType,
        draftState,
        (rowIndex, timeBlock) => {
            SetTimeBlockRowIndex(timeBlock, rowIndex);
        }
    );
};
