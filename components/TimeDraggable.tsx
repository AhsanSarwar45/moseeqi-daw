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
    GetSelectionStartIndex,
    Select,
    CommitSelectionUpdate,
    LeftResizeSelection,
    DragSelection,
    RightResizeSelection,
    GetSelectionOffsets,
} from "@Utility/SelectionUtils";
import { Dimension } from "@Types/Types";
import { StrDimToNum } from "@Utility/DimensionUtils";

// const [addMouseUpListener, removeMouseUpListener] = Listener();
type ModifyHandler = (
    changedValue: number,
    initialTimeBlock: TimeBlock
) => void;

interface TimeDraggableProps {
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
    onMouseDown: MouseEventHandler<HTMLDivElement>;
    onDragX: ModifyHandler;
    onDragY: ModifyHandler;
    onResizeRight: ModifyHandler;
    onResizeLeft: ModifyHandler;
    bgColor: string;
    borderColor: string;
    selectedBorderColor: string;
    borderRadius: Dimension;
}

const TimeDraggable = (props: TimeDraggableProps) => {
    const selectionTimeOffsets = useRef<Array<number>>([]);
    const selectionRowOffsets = useRef<Array<number>>([]);
    const selectionStartIndex = useRef<number>(0);
    const selectionRowStartIndex = useRef<number>(0);

    const isDraggingRef = useRef(false);
    const isResizingRightRef = useRef(false);
    const isResizingLeftRef = useRef(false);

    const resizeAreaWidth = 8;

    const dragOffset = useRef({ x: 0, y: 0 });
    const resizeOffset = useRef(0);

    const partRef = useRef<HTMLElement>(null);

    const prevTime = useRef(0);
    const prevRowIndex = useRef(0);
    const hasChanged = useRef(false);

    const initialTimeBlock = useRef(props.timeBlock);

    const width = props.timeBlock.duration * props.pixelsPerSecond;
    const left = props.timeBlock.startTime * props.pixelsPerSecond;

    const HandleMouseMove = useCallback(
        (event: MouseEvent) => {
            if (isDraggingRef.current) {
                let posX = event.clientX - dragOffset.current.x;
                posX = Snap(posX, props.snapWidth);

                const startTime = posX / props.pixelsPerSecond;
                const hasTimeChanged = startTime !== prevTime.current;

                let posY = event.clientY - dragOffset.current.y;
                posY = Snap(posY, props.rowHeight);
                posY = Math.max(0, posY);

                const rowIndex = Math.floor(posY / props.rowHeight);
                const hasRowChanged = rowIndex !== prevRowIndex.current;

                if (hasTimeChanged || hasRowChanged) {
                    DragSelection(
                        startTime,
                        rowIndex,
                        selectionTimeOffsets.current,
                        selectionRowOffsets.current,
                        selectionStartIndex.current,
                        selectionRowStartIndex.current,
                        props.selectionType,
                        true
                    );
                    hasChanged.current = true;
                }
                if (hasTimeChanged) {
                    props.onDragX(startTime, initialTimeBlock.current);
                    prevTime.current = startTime;
                }
                if (hasRowChanged) {
                    // console.log(rowIndex, props.timeBlock.rowIndex);
                    props.onDragY(rowIndex, initialTimeBlock.current);
                    prevRowIndex.current = rowIndex;
                }
            } else if (isResizingLeftRef.current) {
                let pos = event.clientX + resizeOffset.current;
                pos = Snap(pos, props.snapWidth);
                const startTime = pos / props.pixelsPerSecond;

                if (startTime !== prevTime.current) {
                    LeftResizeSelection(
                        startTime,
                        selectionTimeOffsets.current,
                        selectionStartIndex.current,
                        props.selectionType,
                        false
                    );
                    props.onResizeLeft(startTime, initialTimeBlock.current);
                    hasChanged.current = true;
                    prevTime.current = startTime;
                }
            } else if (isResizingRightRef.current) {
                let pos = event.clientX + resizeOffset.current;
                pos = Snap(pos, props.snapWidth);
                // pos = Math.max(pos, left + minWidth);

                const stopTime = pos / props.pixelsPerSecond;

                if (stopTime !== prevTime.current) {
                    RightResizeSelection(
                        stopTime,
                        selectionTimeOffsets.current,
                        props.selectionType
                    );
                    prevTime.current = stopTime;
                    props.onResizeRight(stopTime, initialTimeBlock.current);
                    hasChanged.current = true;
                }
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [props.snapWidth, props.rowHeight, props.pixelsPerSecond]
    );

    const SetupSelection = (): Array<SubSelectionIndex> => {
        const newSelectedPartIndices = Select(
            props.subSelectionIndex.containerIndex,
            props.subSelectionIndex.selectionIndex,
            props.selectionType
        );

        selectionTimeOffsets.current = GetSelectionOffsets(
            props.timeBlock,
            newSelectedPartIndices,
            props.selectionType,
            "startTime"
        );

        selectionStartIndex.current = GetSelectionStartIndex(
            newSelectedPartIndices,
            props.selectionType,
            "startTime"
        );

        return newSelectedPartIndices;
    };

    const HandleMouseUp = useCallback(
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
        window.addEventListener("mouseup", HandleMouseUp);
        return () => {
            window.removeEventListener("mouseup", HandleMouseUp);
        };
    }, [HandleMouseUp]);

    const StartDrag = () => {
        hasChanged.current = false;
        initialTimeBlock.current = props.timeBlock;
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

                        selectionRowOffsets.current = GetSelectionOffsets(
                            props.timeBlock,
                            selectionIndices,
                            props.selectionType,
                            "rowIndex"
                        );

                        selectionRowStartIndex.current = GetSelectionStartIndex(
                            selectionIndices,
                            props.selectionType,
                            "rowIndex"
                        );

                        isDraggingRef.current = true;
                        prevRowIndex.current = props.timeBlock.rowIndex;
                        prevTime.current = props.timeBlock.startTime;
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

                        selectionTimeOffsets.current = GetSelectionOffsets(
                            props.timeBlock,
                            newSelectedIndices,
                            props.selectionType,
                            "stopTime"
                        );

                        isResizingRightRef.current = true;
                        resizeOffset.current = left + width - event.clientX;
                        prevTime.current = props.timeBlock.stopTime;
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
                        prevTime.current = props.timeBlock.startTime;

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
    onDragX: () => {},
    onDragY: () => {},
    onResizeLeft: () => {},
    onResizeRight: () => {},
    // parentRef: null,
};

export default TimeDraggable;
