import { Box } from "@chakra-ui/react";
import React, { useEffect, useRef } from "react";
import useMouse from "@react-hook/mouse-position";
import { Snap } from "@Utility/SnapUtils";
import { SubSelectionIndex } from "@Interfaces/Selection";

interface DraggableProps {
    children: React.ReactNode;
    setStartTime: (
        startTime: number,
        selectionOffsets: Array<number>,
        selectionStartIndex: number,
        keepDuration: boolean
    ) => void;
    setStopTime: (stopTime: number, selectionOffsets: Array<number>) => void;
    getSelectionStartOffsets: (selection: any) => Array<number>;
    getSelectionStopOffsets: (selection: any) => Array<number>;
    getSelectionStartIndex: (selection: any) => number;
    setSelectedIndices: () => any;
    snapWidth: number;
    snapHeight: number;
    startTime: number;
    duration: number;
    pixelsPerSecond: number;
    isSelected: boolean;
}

const TimeDraggable = (props: DraggableProps) => {
    const selectionOffsets = useRef<Array<number>>([]);
    const selectionStartIndex = useRef<number>(0);

    const isDraggingRef = useRef(false);
    const isResizingRightRef = useRef(false);
    const isResizingLeftRef = useRef(false);
    // const prevDelta = useRef(0);

    const resizeAreaWidth = 8;

    const dragOffset = useRef(0);
    const resizeOffset = useRef(0);

    const partRef = useRef<HTMLElement>(null);
    const parentRef = useRef<HTMLElement | null>(null);

    const mouse = useMouse(parentRef, {
        enterDelay: 100,
        leaveDelay: 100,
    });

    const width = props.duration * props.pixelsPerSecond;
    const left = props.startTime * props.pixelsPerSecond;

    // const [xPos, setXPos] = useState(
    //     props.part.startTime * props.pixelsPerSecond
    // );

    useEffect(() => {
        if (partRef.current) {
            parentRef.current = partRef.current.parentNode as HTMLElement;
            // console.log(parentRef.current);
        }
    }, []);

    const SelectPart = (): Array<SubSelectionIndex> => {
        return props.setSelectedIndices();
    };

    const SetStartOffsets = () => {
        const newSelectedPartIndices = SelectPart();

        selectionOffsets.current = props.getSelectionStartOffsets(
            newSelectedPartIndices
        );
        selectionStartIndex.current = props.getSelectionStartIndex(
            newSelectedPartIndices
        );
    };

    useEffect(() => {
        window.addEventListener("mouseup", () => {
            isDraggingRef.current = false;
            isResizingLeftRef.current = false;
            isResizingRightRef.current = false;
        });
        return () => {
            window.removeEventListener("mouseup", () => {});
        };
    }, []);

    useEffect(() => {
        if (isDraggingRef.current) {
            if (mouse.x !== null) {
                let pos = mouse.x - dragOffset.current;
                pos = Snap(pos, props.snapWidth);
                pos = Math.max(0, pos);

                const startTime = pos / props.pixelsPerSecond;

                props.setStartTime(
                    startTime,
                    selectionOffsets.current,
                    selectionStartIndex.current,
                    true
                );
            }
        } else if (isResizingLeftRef.current) {
            if (mouse.x !== null) {
                let pos = mouse.x + resizeOffset.current;
                pos = Snap(pos, props.snapWidth);
                pos = Math.max(0, pos);
                // pos = Math.max(pos, left + minWidth);

                const startTime = pos / props.pixelsPerSecond;

                props.setStartTime(
                    startTime,
                    selectionOffsets.current,
                    selectionStartIndex.current,
                    false
                );
            }
        } else if (isResizingRightRef.current) {
            if (mouse.x !== null) {
                let pos = mouse.x + resizeOffset.current;
                pos = Snap(pos, props.snapWidth);
                // pos = Math.max(pos, left + minWidth);

                const stopTime = pos / props.pixelsPerSecond;
                props.setStopTime(stopTime, selectionOffsets.current);
            }
        }
    }, [mouse.x]);

    return (
        <Box
            ref={partRef as any}
            height="full"
            position="absolute"
            width={`${width}px`}
            left={`${left}px`}
        >
            <Box
                // left={props.part.startTime * props.pixelsPerSecond}
                zIndex={-10}
                // marginTop={"-1px"}
                height="full"
                width="full"
                bgColor="primary.500"
                borderWidth={1}
                borderColor={props.isSelected ? "brand.secondary" : "white"}
                onMouseDown={(event) => {
                    event.preventDefault();
                    SetStartOffsets();

                    isDraggingRef.current = true;

                    if (mouse.x !== null) {
                        dragOffset.current = mouse.x - left;
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
                    const newSelectedPartIndices = SelectPart();

                    selectionOffsets.current = props.getSelectionStopOffsets(
                        newSelectedPartIndices
                    );

                    isResizingRightRef.current = true;
                    if (mouse.x !== null) {
                        dragOffset.current = left + width - mouse.x;
                    }
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

                    SetStartOffsets();

                    isResizingLeftRef.current = true;
                    if (mouse.x !== null) {
                        dragOffset.current = left - mouse.x;
                    }
                }}
                // bgColor="red"
            />
            {props.children}
        </Box>
    );
};

TimeDraggable.defaultProps = {
    snapWidth: 1,
    snapHeight: 1,
};

export default TimeDraggable;
