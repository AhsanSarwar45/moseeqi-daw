import { Draft } from "immer";
import { isHotkeyPressed } from "react-hotkeys-hook";
import _ from "lodash";

import { PianoKeys } from "@data/Constants";
import { defaultMinPartDuration } from "@data/Defaults";
import { getState, setState, StoreState } from "@data/stores/project";
import { useStore } from "@data/stores/project";
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
import { UpdateNote } from "./note";
import { setPartTime, updatePart } from "./part";
import {
    getTimeBlockBounds,
    setTimeBlock,
    setTimeBlockRowIndex,
} from "./time-block";
import { getLastSelectedTrackConst, getSelectedTrack } from "./track";

export const setSelectedIndices = (
    selectedIds: Draft<SelectionId>[],
    selectionType: SelectionType,
    draftState: Draft<StoreState>
) => {
    console.log("selectedTracksId", selectionType, selectedIds);
    switch (selectionType) {
        case SelectionType.Part:
            draftState.selectedPartsId = selectedIds as SelectionSubId[];
            break;
        case SelectionType.Note:
            draftState.selectedNotesId = selectedIds as SelectionSubId[];
            break;
        case SelectionType.Track:
            draftState.selectedTracksId = selectedIds as Id[];
            break;
    }
};

export const getTimeBlockSelectionId = ([
    timeBlockId,
    timeBlock,
]: ChildTimeBlockRecord): SelectionSubId => {
    return { containerId: timeBlock.parentId, entityId: timeBlockId };
};

export const selectTimeBlock = (
    timeBlockRecord: ChildTimeBlockRecord,
    selectionType: SelectionType
) => {
    const selectionId = getTimeBlockSelectionId(timeBlockRecord);
    select(selectionId, selectionType);
};

export const select = (id: SelectionId, selectionType: SelectionType) => {
    setState((draftState) => {
        let selectedIds = getSelectedIds(selectionType);
        console.log("selectedIds", selectedIds);
        const isIdSelected = checkIsIdSelected(id, selectedIds);

        if (isHotkeyPressed("shift")) {
            // if this object is already selected, deselect it, otherwise select it
            if (isIdSelected) {
                selectedIds = selectedIds.filter((selectedId) => {
                    selectedId !== id;
                });
            } else {
                selectedIds = [...selectedIds, id];
            }
        } else {
            // If selection does not contain this object, then reset selected object to only this object
            if (!isIdSelected) {
                selectedIds = [id];
            }
        }
        setSelectedIndices(selectedIds, selectionType, draftState);
    }, `Select ${SelectionType.toString(selectionType).toLowerCase()}`);
};

export const getContainer = (
    selectionType: SelectionType,
    draftState: Draft<StoreState> = getState()
): Draft<ContainerMap> => {
    if (selectionType === SelectionType.Part) return draftState.tracks;
    // Notes can only be selected (in the piano roll) from the currently selected track
    else return getSelectedTrack(draftState).parts;
};

export const getSubContainer = (
    selectionType: SelectionType,
    container: Draft<Container>
): Draft<ChildTimeBlockMap> => {
    if (selectionType === SelectionType.Part)
        return (container as Draft<Track>).parts;
    else return (container as Draft<Part>).notes;
};

export const getAbsoluteTimeBlock = (
    timeBlock: ChildTimeBlock,
    selectionType: SelectionType
): TimeBlock => {
    if (selectionType === SelectionType.Note) {
        const part = getContainer(selectionType).get(
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

export const getChildTimeBlockRecords = (
    selectionType: SelectionType,
    draftState: Draft<StoreState> = getState()
): ChildTimeBlockRecord[] => {
    const timeBlocksRecords: ChildTimeBlockRecord[] = [];
    const containers = getContainer(selectionType, draftState);
    Array.from(containers.entries()).forEach(([containerId, container]) => {
        const subContainer = getSubContainer(selectionType, container);
        Array.from(subContainer.entries()).forEach((timeBlockRecord) => {
            timeBlocksRecords.push(timeBlockRecord);
        });
    });
    return timeBlocksRecords;
};

const doBoxesIntersect = (a: BoxBounds, b: BoxBounds): boolean => {
    return (
        Math.abs(a.left + a.width / 2 - (b.left + b.width / 2)) * 2 <
            a.width + b.width &&
        Math.abs(a.top + a.height / 2 - (b.top + b.height / 2)) * 2 <
            a.height + b.height
    );
};

export const dragSelectTimeBlocks = (
    selectionBounds: BoxBounds,
    pixelsPerSecond: number,
    pixelsPerRow: number,
    selectionType: SelectionType
) => {
    setState((draftState) => {
        const selectedIds: SelectionSubId[] = [];
        const timeBlockRecords = getChildTimeBlockRecords(
            selectionType,
            draftState
        );
        timeBlockRecords.forEach(([entityId, timeBlock]) => {
            const absoluteTimeBlock = getAbsoluteTimeBlock(
                timeBlock,
                selectionType
            );
            const noteBounds = getTimeBlockBounds(
                absoluteTimeBlock,
                pixelsPerSecond,
                pixelsPerRow
            );
            if (doBoxesIntersect(selectionBounds, noteBounds)) {
                selectedIds.push({ containerId: timeBlock.parentId, entityId });
            }
        });
        setSelectedIndices(selectedIds, selectionType, draftState);
    }, `Drag select ${SelectionType.toString(selectionType).toLowerCase()}`);
};

export const checkIsIdSelected = (
    id: SelectionId,
    selectedIds: SelectionId[]
): boolean => {
    return selectedIds.some((selectedId) => {
        return _.isEqual(selectedId, id);
    });
};

export const checkIsTimeBlockSelected = (
    timeBlockRecord: ChildTimeBlockRecord,
    selectedIds: SelectionId[]
): boolean => {
    const selectionId = getTimeBlockSelectionId(timeBlockRecord);
    return checkIsIdSelected(selectionId, selectedIds);
};

// export const getTimeBlock = (
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

export const getEntityFromId = (
    { containerId, entityId }: SelectionSubId,
    selectionType: SelectionType,
    draftState: Draft<StoreState> = getState()
): Draft<ChildTimeBlock> => {
    const containers = getContainer(selectionType, draftState);
    console.log("containers", containers, containerId, entityId);
    const container = containers.get(containerId) as Draft<Container>;
    const subContainer = getSubContainer(selectionType, container);
    return subContainer.get(entityId) as Draft<ChildTimeBlock>;
};

export const getSelectionStartValue = (
    selectionType: SelectionType,
    property: "startTime" | "rowIndex"
): number => {
    let selectionStartValue = 100000;
    const selectedIds = getSelectedIds(selectionType) as SelectionSubId[];
    selectedIds.forEach((selectedId) => {
        const entity = getEntityFromId(selectedId, selectionType);
        selectionStartValue = Math.min(selectionStartValue, entity[property]);
    });
    return selectionStartValue;
};

export const getSelectionStartIndex = (
    selectionType: SelectionType,
    property: "startTime" | "rowIndex"
): number => {
    let selectionStartValue = 100000;
    let selectionStartIndex = 0;
    const selectedIds = getSelectedIds(selectionType) as SelectionSubId[];
    selectedIds.forEach((selectedId, index) => {
        const entity = getEntityFromId(selectedId, selectionType);
        const value = entity[property];
        if (value < selectionStartValue) {
            selectionStartValue = value;
            selectionStartIndex = index;
        }
    });
    return selectionStartIndex;
};

export const getSelectionOffsets = (
    timeBlock: TimeBlock,
    selectionType: SelectionType,
    property: "startTime" | "stopTime" | "rowIndex"
): Array<number> => {
    const selectedIds = getSelectedIds(selectionType) as SelectionSubId[];
    return selectedIds.map((selectedId) => {
        const entity = getEntityFromId(selectedId, selectionType);
        return timeBlock[property] - entity[property];
    });
};

export const getSelectedIds = (
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

const updateTimeObject = (
    entity: ChildTimeBlockRecord,
    tracks: Draft<TrackMap>,
    selectionType: SelectionType
) => {
    if (selectionType === SelectionType.Note) {
        UpdateNote(entity as NoteRecord, tracks);
    } else if (selectionType === SelectionType.Part) {
        updatePart(entity as PartRecord);
    }
};

// export const getAbsoluteTime = (
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

export const commitSelectionUpdate = (selectionType: SelectionType) => {
    setState((draftState) => {
        const selectedIds = getSelectedIds(
            selectionType,
            draftState
        ) as SelectionSubId[];
        selectedIds.forEach((selectedId) => {
            const timeObject = getEntityFromId(
                selectedId,
                selectionType,
                draftState
            );
            updateTimeObject(
                [selectedId.entityId, timeObject],
                draftState.tracks,
                selectionType
            );
        });
    }, `Modify ${SelectionType.toString(selectionType).toLowerCase()}`);
};

export const clampSelectionStart = (
    value: number,
    offsets: number[],
    startIndex: number
) => {
    const startRowOffset = offsets[startIndex];
    return value - startRowOffset < 0 ? startRowOffset - value : 0;
};

export const dragSelection = (
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
            setSelectedStartTime(
                newStartTime,
                offsetsX,
                startIndexX,
                selectionType,
                draftState,
                keepDuration
            );
            setSelectionRowIndex(
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

export const leftResizeSelection = (
    newStartTime: number,
    offsetsX: Array<number>,
    startIndexX: number,
    selectionType: SelectionType,
    keepDuration: boolean = false
) => {
    setState(
        (draftState) => {
            setSelectedStartTime(
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

export const rightResizeSelection = (
    newStopTime: number,
    offsetsX: Array<number>,
    selectionType: SelectionType
) => {
    setState(
        (draftState) => {
            setSelectedStopTime(
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

export const modifySelectedTimeBlocks = (
    newValue: number,
    offsets: number[],
    selectionType: SelectionType,
    draftState: Draft<StoreState>,
    recipe: (value: number, timeBlock: Draft<ChildTimeBlock>) => void
) => {
    const selectedIds = getSelectedIds(selectionType) as SelectionSubId[];
    selectedIds.forEach((selectedId, index) => {
        const offset = offsets[index];
        let value = newValue - offset;
        const entity = getEntityFromId(selectedId, selectionType, draftState);
        recipe(value, entity);
    });
};

export const setSelectedStartTime = (
    newStartTime: number,
    offsetsX: number[],
    startIndexX: number,
    selectionType: SelectionType,
    draftState: Draft<StoreState>,
    keepDuration: boolean = false
) => {
    const selectedIds = getSelectedIds(selectionType) as SelectionSubId[];
    const startEntity = getEntityFromId(
        selectedIds[startIndexX],
        selectionType
    );
    const absoluteSelectionStartTime = getAbsoluteTimeBlock(
        startEntity,
        selectionType
    ).startTime;

    newStartTime += clampSelectionStart(
        absoluteSelectionStartTime,
        offsetsX,
        startIndexX
    );

    modifySelectedTimeBlocks(
        newStartTime,
        offsetsX,
        selectionType,
        draftState,
        (startTime, timeBlock) => {
            let stopTime = keepDuration
                ? startTime + timeBlock.duration
                : timeBlock.stopTime;
            stopTime = Math.max(stopTime, startTime + defaultMinPartDuration);
            setTimeBlock(timeBlock, startTime, stopTime);
        }
    );
};
export const setSelectedStopTime = (
    newStopTime: number,
    offsetsX: Array<number>,
    selectionType: SelectionType,
    draftState: Draft<StoreState>
) => {
    modifySelectedTimeBlocks(
        newStopTime,
        offsetsX,
        selectionType,
        draftState,
        (stopTime, timeBlock) => {
            stopTime = Math.max(
                stopTime,
                timeBlock.startTime + defaultMinPartDuration
            );
            setTimeBlock(timeBlock, timeBlock.startTime, stopTime);
        }
    );
};

export const setSelectionRowIndex = (
    newRowIndex: number,
    offsetsY: number[],
    startIndexY: number,
    selectionType: SelectionType,
    draftState: Draft<StoreState>
) => {
    newRowIndex += clampSelectionStart(newRowIndex, offsetsY, startIndexY);
    modifySelectedTimeBlocks(
        newRowIndex,
        offsetsY,
        selectionType,
        draftState,
        (rowIndex, timeBlock) => {
            setTimeBlockRowIndex(timeBlock, rowIndex);
        }
    );
};
