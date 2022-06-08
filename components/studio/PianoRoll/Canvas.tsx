import { Box } from "@chakra-ui/react";
import { noteLengthOptions } from "@Data/Constants";
import { useEvent } from "@Hooks/useEvent";
import { BoxBounds } from "@Interfaces/Box";
import { Coordinate } from "@Interfaces/Coordinate";
import {
    AddNoteToSelectedTrack,
    ClearSelectedNotesIndices,
} from "@Utility/NoteUtils";
import { DragSelectNotes } from "@Utility/SelectionUtils";
import { SnapDown } from "@Utility/SnapUtils";
import { GetPixelsPerSecond } from "@Utility/TimeUtils";
import React, { useCallback, useEffect, useRef, useState } from "react";

interface CanvasProps {
    pixelsPerSecond: number;
    pixelsPerRow: number;
    columnWidth: number;
    isSnappingOn: boolean;
    selectedDrawLengthIndex: number;
}

const Canvas = (props: CanvasProps) => {
    const clickAreaRef = useRef<any>(null);
    const isDragSelecting = useRef(false);
    const dragSelectStart = useRef<Coordinate>({ x: 0, y: 0 });
    const dragSelectCurrent = useRef<Coordinate>({ x: 0, y: 0 });

    const [selectionBounds, setSelectionBounds] = useState<BoxBounds>({
        left: 0,
        top: 0,
        width: 0,
        height: 0,
    });

    const IsSelectionZero = useCallback(() => {
        return selectionBounds.width === 0 && selectionBounds.height === 0;
    }, [selectionBounds]);

    const ResetSelectionBounds = () => {
        setSelectionBounds({
            left: 0,
            top: 0,
            width: 0,
            height: 0,
        });
    };

    const HandleMouseUp = useCallback(() => {
        if (isDragSelecting.current) {
            if (!IsSelectionZero()) {
                DragSelectNotes(
                    selectionBounds,
                    props.pixelsPerSecond,
                    props.pixelsPerRow
                );
            }
            isDragSelecting.current = false;
            ResetSelectionBounds();
        }
    }, [
        props.pixelsPerRow,
        props.pixelsPerSecond,
        IsSelectionZero,
        selectionBounds,
    ]);

    useEvent("mouseup", HandleMouseUp);

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

        setSelectionBounds({
            top: top,
            left: left,
            width: right - left,
            height: bottom - top,
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
                // Check if this is a double click
                // This is a workaround for the fact that "mouseup" event listener disables onDoubleClick
                if (event.detail === 2) {
                    const mouseCoords = GetRelativeMouseCoords(event);

                    if (props.isSnappingOn) {
                        mouseCoords.x = SnapDown(
                            mouseCoords.x,
                            props.columnWidth
                        );
                    }

                    AddNoteToSelectedTrack(
                        mouseCoords.x / props.pixelsPerSecond,
                        Math.floor(mouseCoords.y / props.pixelsPerRow),
                        noteLengthOptions[props.selectedDrawLengthIndex].divisor
                    );
                } else {
                    if (event.currentTarget === event.target) {
                        ClearSelectedNotesIndices();
                        isDragSelecting.current = true;
                        dragSelectStart.current = GetRelativeMouseCoords(event);
                        dragSelectCurrent.current = dragSelectStart.current;
                        UpdateBounds();
                    }
                }
            }}
            onMouseMove={(event) => {
                if (isDragSelecting.current) {
                    dragSelectCurrent.current = GetRelativeMouseCoords(event);
                    UpdateBounds();
                }
            }}
        >
            {!IsSelectionZero() && (
                <Box
                    bgColor="rgba(0, 0, 0, 0.2)"
                    borderColor="white"
                    borderWidth={1}
                    position="absolute"
                    top={`${selectionBounds.top}px`}
                    left={`${selectionBounds.left}px`}
                    height={`${selectionBounds.height}px`}
                    width={`${selectionBounds.width}px`}
                />
            )}
        </Box>
    );
};

export default Canvas;
