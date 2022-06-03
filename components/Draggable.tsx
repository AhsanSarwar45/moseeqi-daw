import { Box } from "@chakra-ui/react";
import React, { useEffect, useRef } from "react";
import useMouse from "@react-hook/mouse-position";
import { Snap } from "@Utility/SnapUtils";
import { SubSelectionIndex } from "@Interfaces/Selection";
import { useSsrCompatible } from "@Hooks/useSsrCompatible";
import { useMousePosition } from "@Hooks/useMousePosition";
import Listener from "@Data/Listener";

// const [addMouseUpListener, removeMouseUpListener] = Listener();

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

    const width = props.duration * props.pixelsPerSecond;
    const left = props.startTime * props.pixelsPerSecond;

    const mousePosition = useRef({ x: 0, y: 0 });

    // const [xPos, setXPos] = useState(
    //     props.part.startTime * props.pixelsPerSecond
    // );

    const HandleMouseMove = (event: MouseEvent) => {
        const rect = parentRef.current?.getBoundingClientRect() as DOMRect;
        let mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        mousePosition.current = { x: mouseX, y: event.clientY };
        if (isDraggingRef.current) {
            let pos = mouseX - dragOffset.current;
            pos = Snap(pos, props.snapWidth);
            pos = Math.max(0, pos);

            const startTime = pos / props.pixelsPerSecond;

            props.setStartTime(
                startTime,
                selectionOffsets.current,
                selectionStartIndex.current,
                true
            );
        } else if (isResizingLeftRef.current) {
            let pos = mouseX + resizeOffset.current;
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
        } else if (isResizingRightRef.current) {
            let pos = mouseX + resizeOffset.current;
            pos = Snap(pos, props.snapWidth);
            // pos = Math.max(pos, left + minWidth);

            const stopTime = pos / props.pixelsPerSecond;
            props.setStopTime(stopTime, selectionOffsets.current);
        }
    };

    useEffect(() => {
        if (partRef.current) {
            parentRef.current = partRef.current.parentNode as HTMLElement;

            parentRef.current.addEventListener("mousemove", HandleMouseMove);
        }

        return () => {
            parentRef.current?.removeEventListener(
                "mousemove",
                HandleMouseMove
            );
        };
        // console.log(parentRef.current);
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

    const HandleDrag = () => {
        isDraggingRef.current = false;
        isResizingLeftRef.current = false;
        isResizingRightRef.current = false;
    };

    useEffect(() => {
        window.addEventListener("mouseup", HandleDrag);
        return () => {
            window.removeEventListener("mouseup", HandleDrag);
        };
    }, []);

    // useEffect(() => {
    //     console.log("render", mouse.x);

    // }, [mouse.x]);

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

                    dragOffset.current = mousePosition.current.x - left;

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
                    // event.preventDefault();
                    const newSelectedPartIndices = SelectPart();

                    selectionOffsets.current = props.getSelectionStopOffsets(
                        newSelectedPartIndices
                    );

                    isResizingRightRef.current = true;

                    dragOffset.current = left + width - mousePosition.current.x;
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
                    // event.preventDefault();

                    SetStartOffsets();

                    isResizingLeftRef.current = true;
                    dragOffset.current = left - mousePosition.current.x;
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
