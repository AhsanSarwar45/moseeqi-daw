import { Box } from "@chakra-ui/react";
import React, { memo, useContext, useEffect, useRef, useState } from "react";
import { Rnd } from "react-rnd";
import useMouse from "@react-hook/mouse-position";

import {
    selectMoveSelectedParts,
    selectSetSelectedPartsIndices,
    selectSetSelectedPartsStartTime,
    selectSetSelectedPartsStopTime,
    useTracksStore,
} from "@Data/TracksStore";
import { Part } from "@Interfaces/Part";
import {
    GetSelectionStartOffsets,
    GetSelectionStartIndex,
    GetSelectionStartTime,
    IsPartSelected,
    GetSelectionStopOffsets,
} from "@Utility/SelectionUtils";
import { PartSelectionIndex } from "@Interfaces/Selection";
import { Snap } from "@Utility/SnapUtils";

interface PartViewProps {
    part: Part;
    partIndex: number;
    trackIndex: number;
    pixelsPerSecond: number;
    snapWidth: number;
    isShiftHeld: boolean;
    isSelected: boolean;
    // onDragStop: () => void;
    // onResizeStop: () => void;
}

const PartView = (props: PartViewProps) => {
    const selectionOffsets = useRef<Array<number>>([]);
    const selectionStartIndex = useRef<number>(0);

    const isDraggingRef = useRef(false);
    const isResizingEndRef = useRef(false);
    const isResizingStartRef = useRef(false);
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

    // const [xPos, setXPos] = useState(
    //     props.part.startTime * props.pixelsPerSecond
    // );
    const setSelectedPartsStopTime = useTracksStore(
        selectSetSelectedPartsStopTime
    );
    const setSelectedPartsStartTime = useTracksStore(
        selectSetSelectedPartsStartTime
    );
    const setSelectedPartsIndices = useTracksStore(
        selectSetSelectedPartsIndices
    );

    useEffect(() => {
        if (partRef.current) {
            parentRef.current = partRef.current.parentNode as HTMLElement;
            // console.log(parentRef.current);
        }
    }, []);

    const SelectPart = (): Array<PartSelectionIndex> => {
        return setSelectedPartsIndices(
            props.trackIndex,
            props.partIndex,
            props.isShiftHeld
        );
    };

    const SetStartOffsets = () => {
        const newSelectedPartIndices = SelectPart();

        selectionOffsets.current = GetSelectionStartOffsets(
            props.part,
            newSelectedPartIndices
        );
        selectionStartIndex.current = GetSelectionStartIndex(
            newSelectedPartIndices
        );
    };

    const left = props.part.startTime * props.pixelsPerSecond;
    const width =
        props.pixelsPerSecond * (props.part.stopTime - props.part.startTime);

    useEffect(() => {
        window.addEventListener("mouseup", () => {
            isDraggingRef.current = false;
            isResizingStartRef.current = false;
            isResizingEndRef.current = false;
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

                setSelectedPartsStartTime(
                    startTime,
                    selectionOffsets.current,
                    selectionStartIndex.current,
                    true
                );
            }
        } else if (isResizingStartRef.current) {
            if (mouse.x !== null) {
                let pos = mouse.x + resizeOffset.current;
                pos = Snap(pos, props.snapWidth);
                // pos = Math.max(pos, left + minWidth);

                const startTime = pos / props.pixelsPerSecond;
                setSelectedPartsStartTime(
                    startTime,
                    selectionOffsets.current,
                    selectionStartIndex.current,
                    false
                );
            }
        } else if (isResizingEndRef.current) {
            if (mouse.x !== null) {
                let pos = mouse.x + resizeOffset.current;
                pos = Snap(pos, props.snapWidth);
                // pos = Math.max(pos, left + minWidth);

                const stopTime = pos / props.pixelsPerSecond;
                setSelectedPartsStopTime(stopTime, selectionOffsets.current);
            }
        }
    }, [mouse.x]);

    // // print evertime this component renders
    // useEffect(() => {
    //     console.log("PartView render", props.partIndex);
    // });

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
                    // prevMouseX.current = data.x;
                }}
                cursor="move"

                // onMouseMove={() => {

                // }}
                // onMouseUp={() => {
                //     isDraggingRef.current = false;
                // }}
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

                    selectionOffsets.current = GetSelectionStopOffsets(
                        props.part,
                        newSelectedPartIndices
                    );

                    isResizingEndRef.current = true;
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

                    isResizingStartRef.current = true;
                    if (mouse.x !== null) {
                        dragOffset.current = left - mouse.x;
                    }
                }}
                // bgColor="red"
            />

            {props.part.notes.map((note, index) => (
                <Box
                    zIndex={900}
                    key={note.id}
                    bgColor="secondary.500"
                    position="absolute"
                    top={`${note.keyIndex + 1}px`}
                    left={`${note.startTime * props.pixelsPerSecond}px`}
                    width={`${note.duration * props.pixelsPerSecond}px`}
                    height="1px"
                />
            ))}
        </Box>
        // {/* // </Rnd> */}
    );
};

export default PartView;
