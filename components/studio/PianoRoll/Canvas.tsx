import { Box } from "@chakra-ui/react";
import { noteLengthOptions } from "@Data/Constants";
import { Coordinate } from "@Interfaces/Coordinate";
import {
    AddNoteToSelectedTrack,
    ClearSelectedNotesIndices,
} from "@Utility/NoteUtils";
import { SnapDown } from "@Utility/SnapUtils";
import { GetPixelsPerSecond } from "@Utility/TimeUtils";
import React, { useCallback, useEffect, useRef, useState } from "react";

interface CanvasProps {
    basePixelsPerSecond: number;
    columnWidth: number;
    gridCellHeight: number;
    isSnappingOn: boolean;
    selectedDrawLengthIndex: number;
}

const Canvas = (props: CanvasProps) => {
    const clickAreaRef = useRef<any>(null);
    const [isDragSelecting, setIsDragSelecting] = useState(false);
    const dragSelectStart = useRef<Coordinate>({ x: 0, y: 0 });
    const dragSelectCurrent = useRef<Coordinate>({ x: 0, y: 0 });

    const [bounds, setBounds] = useState({
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    });

    const HandleMouseUp = useCallback(() => {
        setIsDragSelecting(false);
        window.removeEventListener("mouseup", HandleMouseUp);
    }, []);

    const GetRelativeMouseCoords = (
        event: React.MouseEvent<HTMLElement>
    ): Coordinate => {
        const rect = clickAreaRef.current?.getBoundingClientRect();

        let x = event.clientX - rect?.left;
        const y = event.clientY - rect?.top;

        return { x, y };
    };

    const UpdateBounds = () => {
        const top = Math.min(
            dragSelectStart.current.y,
            dragSelectCurrent.current.y
        );
        const left = Math.min(
            dragSelectStart.current.x,
            dragSelectCurrent.current.x
        );
        const right = Math.max(
            dragSelectStart.current.x,
            dragSelectCurrent.current.x
        );
        const bottom = Math.max(
            dragSelectStart.current.y,
            dragSelectCurrent.current.y
        );

        setBounds({
            top: top,
            left: left,
            right: right,
            bottom: bottom,
        });
    };

    return (
        <Box
            position="absolute"
            top={0}
            left={0}
            ref={clickAreaRef}
            width="full"
            height="full"
            onMouseDown={(event) => {
                if (event.detail === 2) {
                    console.log("hello");
                    const mouseCoords = GetRelativeMouseCoords(event);

                    if (props.isSnappingOn) {
                        mouseCoords.x = SnapDown(
                            mouseCoords.x,
                            props.columnWidth
                        );
                    }

                    AddNoteToSelectedTrack(
                        mouseCoords.x /
                            GetPixelsPerSecond(props.basePixelsPerSecond),
                        Math.floor(mouseCoords.y / props.gridCellHeight),
                        noteLengthOptions[props.selectedDrawLengthIndex].divisor
                    );
                } else {
                    if (event.currentTarget === event.target) {
                        ClearSelectedNotesIndices();
                        setIsDragSelecting(true);
                        dragSelectStart.current = GetRelativeMouseCoords(event);
                        dragSelectCurrent.current = dragSelectStart.current;
                        UpdateBounds();
                        window.addEventListener("mouseup", HandleMouseUp);
                    }
                }
            }}
            onMouseMove={(event) => {
                if (isDragSelecting) {
                    dragSelectCurrent.current = GetRelativeMouseCoords(event);
                    UpdateBounds();
                }
            }}
            // onMouseUp={HandleFinishDragging}
            // onMouseLeave={HandleFinishDragging}
        >
            {isDragSelecting && (
                <Box
                    bgColor="rgba(0, 0, 0, 0.2)"
                    borderColor="white"
                    borderWidth={1}
                    position="absolute"
                    top={`${bounds.top}px`}
                    left={`${bounds.left}px`}
                    height={`${bounds.bottom - bounds.top}px`}
                    width={`${bounds.right - bounds.left}px`}
                />
            )}
        </Box>
    );
};

export default Canvas;
