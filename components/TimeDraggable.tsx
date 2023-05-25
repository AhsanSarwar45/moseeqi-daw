import { Box } from "@chakra-ui/react";
import React, {
    MouseEventHandler,
    useCallback,
    useEffect,
    useRef,
} from "react";
import { snap } from "@logic/snap";
import { SelectionSubId, SelectionType } from "@Interfaces/Selection";
import { TimeBlock } from "@Interfaces/TimeBlock";
import {
    getSelectionStartIndex,
    select,
    commitSelectionUpdate,
    leftResizeSelection,
    dragSelection,
    rightResizeSelection,
    getSelectionOffsets,
    selectTimeBlock,
} from "@logic/selection";
import { ChildTimeBlockRecord, Dimension } from "@Types/Types";
import { StrDimToNum } from "@logic/dimension";
import { disableHistory, enableHistory } from "@logic/history";

// const [addMouseUpListener, removeMouseUpListener] = Listener();
type ModifyHandler = (
    changedValue: number,
    initialTimeBlock: TimeBlock
) => void;

interface TimeDraggableProps {
    children?: React.ReactNode;
    timeBlockRecord: ChildTimeBlockRecord;
    selectionType: SelectionType;
    isSelected: boolean;
    snapWidth: number;
    rowHeight: number;
    pixelsPerSecond: number;
    height: Dimension;
    top: Dimension;
    onMouseDown: MouseEventHandler<HTMLDivElement>;
    onMouseUp: MouseEventHandler<HTMLDivElement>;
    onDragX: ModifyHandler;
    onDragY: ModifyHandler;
    onDragStop: ModifyHandler;
    onResizeRight: ModifyHandler;
    onResizeRightStop: ModifyHandler;
    onResizeLeft: ModifyHandler;
    onResizeLeftStop: ModifyHandler;
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

    const [timeBlockId, timeBlock] = props.timeBlockRecord;

    const initialTimeBlock = useRef(timeBlock);

    const width = timeBlock.duration * props.pixelsPerSecond;
    const left = timeBlock.startTime * props.pixelsPerSecond;

    const HandleMouseMove = useCallback(
        (event: MouseEvent) => {
            if (isDraggingRef.current) {
                let posX = event.clientX - dragOffset.current.x;
                posX = snap(posX, props.snapWidth);

                const startTime = posX / props.pixelsPerSecond;
                const hasTimeChanged = startTime !== prevTime.current;

                let posY = event.clientY - dragOffset.current.y;
                posY = snap(posY, props.rowHeight);
                posY = Math.max(0, posY);

                const rowIndex = Math.floor(posY / props.rowHeight);
                const hasRowChanged = rowIndex !== prevRowIndex.current;

                if (hasTimeChanged || hasRowChanged) {
                    dragSelection(
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
                pos = snap(pos, props.snapWidth);
                const startTime = pos / props.pixelsPerSecond;

                if (startTime !== prevTime.current) {
                    leftResizeSelection(
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
                pos = snap(pos, props.snapWidth);
                // pos = Math.max(pos, left + minWidth);

                const stopTime = pos / props.pixelsPerSecond;

                if (stopTime !== prevTime.current) {
                    rightResizeSelection(
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

    const setupSelection = () => {
        selectTimeBlock(props.timeBlockRecord, props.selectionType);

        selectionTimeOffsets.current = getSelectionOffsets(
            timeBlock,
            props.selectionType,
            "startTime"
        );

        selectionStartIndex.current = getSelectionStartIndex(
            props.selectionType,
            "startTime"
        );
    };

    const HandleMouseUp = useCallback(
        (event: MouseEvent) => {
            if (event.button === 0) {
                enableHistory();
                if (hasChanged.current) {
                    commitSelectionUpdate(props.selectionType);
                    hasChanged.current = false;
                }
                if (isDraggingRef.current) {
                    props.onDragStop(
                        prevTime.current,
                        initialTimeBlock.current
                    );
                    isDraggingRef.current = false;
                } else if (isResizingLeftRef.current) {
                    props.onResizeLeftStop(
                        prevTime.current,
                        initialTimeBlock.current
                    );
                    isResizingLeftRef.current = false;
                } else if (isResizingRightRef.current) {
                    props.onResizeRightStop(
                        prevTime.current,
                        initialTimeBlock.current
                    );
                    isResizingRightRef.current = false;
                }
                window.removeEventListener("mousemove", HandleMouseMove);
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [HandleMouseMove]
    );

    useEffect(() => {
        window.addEventListener("mouseup", HandleMouseUp);
        return () => {
            window.removeEventListener("mouseup", HandleMouseUp);
        };
    }, [HandleMouseUp]);

    const StartDrag = () => {
        hasChanged.current = false;
        initialTimeBlock.current = timeBlock;
        // We don't want to add all teh intermediate movements to undo history
        disableHistory();
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
            onMouseUp={props.onMouseUp}
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
                        setupSelection();

                        selectionRowOffsets.current = getSelectionOffsets(
                            timeBlock,
                            props.selectionType,
                            "rowIndex"
                        );

                        selectionRowStartIndex.current = getSelectionStartIndex(
                            props.selectionType,
                            "rowIndex"
                        );

                        isDraggingRef.current = true;
                        prevRowIndex.current = timeBlock.rowIndex;
                        prevTime.current = timeBlock.startTime;
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
                        selectTimeBlock(
                            props.timeBlockRecord,
                            props.selectionType
                        );

                        selectionTimeOffsets.current = getSelectionOffsets(
                            timeBlock,
                            props.selectionType,
                            "stopTime"
                        );

                        isResizingRightRef.current = true;
                        resizeOffset.current = left + width - event.clientX;
                        prevTime.current = timeBlock.stopTime;
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
                        setupSelection();

                        isResizingLeftRef.current = true;
                        resizeOffset.current = left - event.clientX;
                        prevTime.current = timeBlock.startTime;

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
    onMouseUp: () => {},
    onDragX: () => {},
    onDragY: () => {},
    onDragStop: () => {},
    onResizeLeft: () => {},
    onResizeLeftStop: () => {},
    onResizeRight: () => {},
    onResizeRightStop: () => {},
    // parentRef: null,
};

export default TimeDraggable;
