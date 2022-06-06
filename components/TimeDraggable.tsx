import { Box } from "@chakra-ui/react";
import React, {
    MouseEventHandler,
    useCallback,
    useEffect,
    useRef,
} from "react";
import { Snap } from "@Utility/SnapUtils";
import { SelectionType, SubSelectionIndex } from "@Interfaces/Selection";
import { TimeBlock } from "@Interfaces/TimeBlock";
import {
    GetSelectionTimeOffsets,
    GetSelectionStartIndex,
    IsSelected,
    Select,
    SetSelectedIndices,
    SetSelectedStartTime,
    SetSelectedStopTime,
    CommitSelectionUpdate,
} from "@Utility/SelectionUtils";
import { Dimension } from "@Types/Types";
import { StrDimToNum } from "@Utility/DimensionUtils";
import {
    DisableUndoHistory,
    EnableUndoHistory,
    SetStoreState,
} from "@Data/SetStoreState";
import { GetTracksCopy } from "@Utility/TrackUtils";
import { Track } from "@Interfaces/Track";

// const [addMouseUpListener, removeMouseUpListener] = Listener();

interface DraggableProps {
    children?: React.ReactNode;
    timeBlock: TimeBlock;
    selectionType: SelectionType;
    subSelectionIndex: SubSelectionIndex;
    isSelected: boolean;
    snapWidth: number;
    rowHeight: number;
    pixelsPerSecond: number;
    height: Dimension;
    top: Dimension;
    setRow: (
        tracks: Array<Track>,
        row: number,
        selectionRowOffsets: Array<number>,
        selectionRowStartIndex: number
    ) => void;
    getSelectionRowStartIndex: (
        selectionIndices: Array<SubSelectionIndex>
    ) => number;
    getSelectionRowOffsets: (
        selectionIndices: Array<SubSelectionIndex>
    ) => Array<number>;
    onMouseDown: MouseEventHandler<HTMLDivElement>;
    bgColor: string;
    borderColor: string;
    selectedBorderColor: string;
    borderRadius: Dimension;
}

const TimeDraggable = (props: DraggableProps) => {
    const selectionTimeOffsets = useRef<Array<number>>([]);
    const selectionRowOffsets = useRef<Array<number>>([]);
    const selectionStartIndex = useRef<number>(0);
    const selectionRowStartIndex = useRef<number>(0);

    const isDraggingRef = useRef(false);
    const isResizingRightRef = useRef(false);
    const isResizingLeftRef = useRef(false);

    const prevRow = useRef<number>(0);

    const resizeAreaWidth = 8;

    const dragOffset = useRef({ x: 0, y: 0 });
    const resizeOffset = useRef(0);

    const partRef = useRef<HTMLElement>(null);

    const hasChanged = useRef(false);

    const width = props.timeBlock.duration * props.pixelsPerSecond;
    const left = props.timeBlock.startTime * props.pixelsPerSecond;

    const HandleMouseMove = useCallback(
        (event: MouseEvent) => {
            if (isDraggingRef.current) {
                let posX = event.clientX - dragOffset.current.x;
                posX = Snap(posX, props.snapWidth);

                const startTime = posX / props.pixelsPerSecond;

                const tracksCopy = GetTracksCopy();
                const hasTimeChanged = startTime !== props.timeBlock.startTime;

                if (hasTimeChanged) {
                    SetSelectedStartTime(
                        tracksCopy,
                        startTime,
                        selectionTimeOffsets.current,
                        selectionStartIndex.current,
                        props.selectionType,
                        true
                    );
                }

                let posY = event.clientY - dragOffset.current.y;
                posY = Snap(posY, props.rowHeight);
                posY = Math.max(0, posY);

                const rowIndex = Math.floor(posY / props.rowHeight);
                const hasRowChanged = rowIndex !== prevRow.current;

                if (hasRowChanged) {
                    props.setRow(
                        tracksCopy,
                        rowIndex,
                        selectionRowOffsets.current,
                        selectionRowStartIndex.current
                    );
                    prevRow.current = rowIndex;
                }

                if (hasTimeChanged || hasRowChanged) {
                    hasChanged.current = true;
                    SetStoreState(
                        { tracks: tracksCopy },
                        `Drag  ${SelectionType.toString(
                            props.selectionType
                        ).toLowerCase()}`,
                        false
                    );
                }
            } else if (isResizingLeftRef.current) {
                let pos = event.clientX + resizeOffset.current;
                pos = Snap(pos, props.snapWidth);
                const startTime = pos / props.pixelsPerSecond;

                if (startTime !== props.timeBlock.startTime) {
                    const tracksCopy = GetTracksCopy();

                    SetSelectedStartTime(
                        tracksCopy,
                        startTime,
                        selectionTimeOffsets.current,
                        selectionStartIndex.current,
                        props.selectionType,
                        false
                    );

                    hasChanged.current = true;
                    SetStoreState(
                        { tracks: tracksCopy },
                        `Resize ${SelectionType.toString(
                            props.selectionType
                        ).toLowerCase()}`,
                        false
                    );
                }
            } else if (isResizingRightRef.current) {
                let pos = event.clientX + resizeOffset.current;
                pos = Snap(pos, props.snapWidth);
                // pos = Math.max(pos, left + minWidth);

                const stopTime = pos / props.pixelsPerSecond;

                if (stopTime !== props.timeBlock.stopTime) {
                    hasChanged.current = true;
                    SetSelectedStopTime(
                        stopTime,
                        selectionTimeOffsets.current,
                        props.selectionType
                    );
                }
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [
            props.snapWidth,
            props.rowHeight,
            props.pixelsPerSecond,
            props.timeBlock,
        ]
    );

    const SetupSelection = (): Array<SubSelectionIndex> => {
        const newSelectedPartIndices = Select(
            props.subSelectionIndex.containerIndex,
            props.subSelectionIndex.selectionIndex,
            props.selectionType
        );

        selectionTimeOffsets.current = GetSelectionTimeOffsets(
            props.timeBlock,
            newSelectedPartIndices,
            props.selectionType,
            "startTime"
        );

        selectionStartIndex.current = GetSelectionStartIndex(
            newSelectedPartIndices,
            props.selectionType
        );

        return newSelectedPartIndices;
    };

    const HandleDrag = useCallback(
        (event: MouseEvent) => {
            if (event.button === 0) {
                if (hasChanged.current) {
                    CommitSelectionUpdate(props.selectionType);
                }

                isDraggingRef.current = false;
                isResizingLeftRef.current = false;
                isResizingRightRef.current = false;
                window.removeEventListener("mousemove", HandleMouseMove);
                hasChanged.current = false;
            }
        },
        [HandleMouseMove, props.selectionType]
    );

    useEffect(() => {
        window.addEventListener("mouseup", HandleDrag);
        return () => {
            window.removeEventListener("mouseup", HandleDrag);
        };
    }, [HandleDrag]);

    const StartDrag = () => {
        hasChanged.current = false;
        window.addEventListener("mousemove", HandleMouseMove);
    };

    return (
        <Box
            ref={partRef as any}
            top={props.top}
            height={props.height}
            position="absolute"
            width={`${width}px`}
            left={`${left}px`}
            onMouseDown={props.onMouseDown}
            onContextMenu={(event) => {
                event.preventDefault();
                return false;
            }}
        >
            <Box
                zIndex={-10}
                height="full"
                width="full"
                bgColor={props.bgColor}
                borderWidth={1}
                borderColor={
                    props.isSelected
                        ? props.selectedBorderColor
                        : props.borderColor
                }
                borderRadius={props.borderRadius}
                onMouseDown={(event) => {
                    event.preventDefault();
                    if (event.button === 0) {
                        const selectionIndices = SetupSelection();

                        selectionRowOffsets.current =
                            props.getSelectionRowOffsets(selectionIndices);
                        selectionRowStartIndex.current =
                            props.getSelectionRowStartIndex(selectionIndices);

                        isDraggingRef.current = true;

                        dragOffset.current = {
                            x: event.clientX - left,
                            y: event.clientY - StrDimToNum(props.top),
                        };

                        StartDrag();
                    }
                    return false;
                }}
                cursor="move"
            />
            <Box
                cursor="e-resize"
                position="absolute"
                top={0}
                left={`${width - resizeAreaWidth / 2}px`}
                width={`${resizeAreaWidth}px`}
                height="full"
                onMouseDown={(event) => {
                    event.preventDefault();
                    if (event.button === 0) {
                        const newSelectedIndices = Select(
                            props.subSelectionIndex.containerIndex,
                            props.subSelectionIndex.selectionIndex,
                            props.selectionType
                        );

                        selectionTimeOffsets.current = GetSelectionTimeOffsets(
                            props.timeBlock,
                            newSelectedIndices,
                            props.selectionType,
                            "stopTime"
                        );

                        isResizingRightRef.current = true;
                        resizeOffset.current = left + width - event.clientX;

                        StartDrag();
                    }
                    return false;
                }}
                // bgColor="red"
            />

            <Box
                cursor="w-resize"
                position="absolute"
                top={0}
                left={`${-resizeAreaWidth / 2}px`}
                width={`${resizeAreaWidth}px`}
                height="full"
                onMouseDown={(event) => {
                    event.preventDefault();
                    if (event.button === 0) {
                        SetupSelection();

                        isResizingLeftRef.current = true;
                        resizeOffset.current = left - event.clientX;

                        StartDrag();
                    }
                    return false;
                }}
                // bgColor="red"
            />
            {props.children}
        </Box>
    );
};

TimeDraggable.defaultProps = {
    snapWidth: 1,
    rowHeight: 1,
    top: 0,
    bgColor: "",
    borderColor: "",
    selectedBorderColor: "",
    borderRadius: 0,
    height: 0,
    onMouseDown: () => {},
    // parentRef: null,
};

export default TimeDraggable;
