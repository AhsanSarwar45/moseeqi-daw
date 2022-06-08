import { Box, useControllableState } from "@chakra-ui/react";
import { useEvent } from "@Hooks/useEvent";
import { BoxBounds } from "@Interfaces/Box";
import { Coordinate } from "@Interfaces/Coordinate";
import { DragSelect } from "@Utility/SelectionUtils";
import React, { useCallback, useEffect, useRef, useState } from "react";

interface CanvasProps {
    onDoubleClick: (mousePos: Coordinate) => void;
    onClick: (mousePos: Coordinate) => void;
    onDragStop: (bounds: BoxBounds) => void;
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

    // console.log(clickAreaRef);

    const HandleMouseUp = useCallback(() => {
        if (isDragSelecting.current) {
            if (!IsSelectionZero()) {
                props.onDragStop(selectionBounds);
            }
            isDragSelecting.current = false;
            ResetSelectionBounds();
            window.removeEventListener("mousemove", HandleMouseMove);
        }
    }, [IsSelectionZero, props.onDragStop, selectionBounds]);

    useEvent("mouseup", HandleMouseUp);

    const HandleMouseMove = useCallback((event: MouseEvent) => {
        if (isDragSelecting.current) {
            dragSelectCurrent.current = GetRelativeMousePos(event);
            UpdateBounds();
        }
    }, []);

    const GetRelativeMousePos = (
        event: React.MouseEvent<HTMLElement> | MouseEvent
    ): Coordinate => {
        const rect = clickAreaRef.current?.getBoundingClientRect();
        return { x: event.clientX - rect?.left, y: event.clientY - rect?.top };
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
                // console.log("click");
                // Check if this is a double click
                // This is a workaround for the fact that "mouseup" event listener disables onDoubleClick
                if (event.detail === 2) {
                    props.onDoubleClick(GetRelativeMousePos(event));
                } else {
                    if (event.currentTarget === event.target) {
                        props.onClick(GetRelativeMousePos(event));
                        isDragSelecting.current = true;
                        dragSelectStart.current = GetRelativeMousePos(event);
                        dragSelectCurrent.current = dragSelectStart.current;
                        window.addEventListener("mousemove", HandleMouseMove);
                        UpdateBounds();
                    }
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
