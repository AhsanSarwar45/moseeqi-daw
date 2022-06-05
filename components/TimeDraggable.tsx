import { Box } from "@chakra-ui/react";
import React, {
    MouseEventHandler,
    useCallback,
    useEffect,
    useRef,
} from "react";
import { Snap } from "@Utility/SnapUtils";
import { SelectionType, SubSelectionIndex } from "@Interfaces/Selection";
import { TimeContainer } from "@Interfaces/TimeContainer";
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
    selectSelectedNoteIndices,
    selectSelectedPartIndices,
    useTracksStore,
} from "@Data/TracksStore";

// const [addMouseUpListener, removeMouseUpListener] = Listener();

interface DraggableProps {
    children?: React.ReactNode;
    timeContainer: TimeContainer;
    selectionType: SelectionType;
    subSelectionIndex: SubSelectionIndex;
    isSelected: boolean;
    snapWidth: number;
    rowHeight: number;
    pixelsPerSecond: number;
    height: Dimension;
    top: Dimension;
    setRow: (
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

    const width = props.timeContainer.duration * props.pixelsPerSecond;
    const left = props.timeContainer.startTime * props.pixelsPerSecond;

    const HandleMouseMove = useCallback(
        (event: MouseEvent) => {
            // console.log(event.clientX);
            if (isDraggingRef.current) {
                let posX = event.clientX - dragOffset.current.x;
                // console.log(posX);
                posX = Snap(posX, props.snapWidth);

                const startTime = posX / props.pixelsPerSecond;
                // console.log(event.clientX, dragOffset.current.x, startTime);

                if (startTime !== props.timeContainer.startTime) {
                    SetSelectedStartTime(
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

                if (rowIndex !== prevRow.current) {
                    props.setRow(
                        rowIndex,
                        selectionRowOffsets.current,
                        selectionRowStartIndex.current
                    );
                }
                prevRow.current = rowIndex;
            } else if (isResizingLeftRef.current) {
                let pos = event.clientX + resizeOffset.current;
                pos = Snap(pos, props.snapWidth);
                // pos = Math.max(0, pos);
                // pos = Math.max(pos, left + minWidth);

                const startTime = pos / props.pixelsPerSecond;

                if (startTime !== props.timeContainer.startTime) {
                    SetSelectedStartTime(
                        startTime,
                        selectionTimeOffsets.current,
                        selectionStartIndex.current,
                        props.selectionType,
                        false
                    );
                }
            } else if (isResizingRightRef.current) {
                let pos = event.clientX + resizeOffset.current;
                pos = Snap(pos, props.snapWidth);
                // pos = Math.max(pos, left + minWidth);

                const stopTime = pos / props.pixelsPerSecond;

                if (stopTime !== props.timeContainer.stopTime) {
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
            props.timeContainer,
        ]
    );

    const SetupSelection = (): Array<SubSelectionIndex> => {
        const newSelectedPartIndices = Select(
            props.subSelectionIndex.containerIndex,
            props.subSelectionIndex.selectionIndex,
            props.selectionType
        );

        selectionTimeOffsets.current = GetSelectionTimeOffsets(
            props.timeContainer,
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
                if (
                    isDraggingRef.current ||
                    isResizingLeftRef.current ||
                    isResizingRightRef.current
                ) {
                    CommitSelectionUpdate(props.selectionType);
                }

                isDraggingRef.current = false;
                isResizingLeftRef.current = false;
                isResizingRightRef.current = false;
                window.removeEventListener("mousemove", HandleMouseMove);
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

                        window.addEventListener("mousemove", HandleMouseMove);
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
                            props.timeContainer,
                            newSelectedIndices,
                            props.selectionType,
                            "stopTime"
                        );

                        isResizingRightRef.current = true;
                        resizeOffset.current = left + width - event.clientX;

                        window.addEventListener("mousemove", HandleMouseMove);
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

                        window.addEventListener("mousemove", HandleMouseMove);
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
