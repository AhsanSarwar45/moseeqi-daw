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
    const selectionStartOffsetRef = useRef(0);
    const prevResizeDeltaRef = useRef(0);
    const selectionOffsets = useRef<Array<number>>([]);
    const selectionStartIndex = useRef<number>(0);
    const isDraggingRef = useRef(false);
    const isResizingRef = useRef(false);
    // const prevDelta = useRef(0);

    const resizeAreaWidth = 8;

    const dragOffset = useRef(0);
    const resizeOffset = useRef(0);

    const partRef = useRef<HTMLElement>(null);
    const parentRef = useRef<HTMLElement | null>(null);

    const minWidth = 10;

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

    const left = props.part.startTime * props.pixelsPerSecond;
    const width =
        props.pixelsPerSecond * (props.part.stopTime - props.part.startTime);

    useEffect(() => {
        window.addEventListener("mouseup", () => {
            isDraggingRef.current = false;
            isResizingRef.current = false;
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
                    selectionStartIndex.current
                );
            }
        } else if (isResizingRef.current) {
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
        // <Rnd
        //     ref={rndRef}
        //     size={{
        //         width:
        //             props.pixelsPerSecond *
        //             (props.part.stopTime - props.part.startTime),
        //         height: "full",
        //     }}
        //     position={{
        //         x: props.part.startTime * props.pixelsPerSecond,
        //         y: 0,
        //     }}
        //     enableResizing={{
        //         right: true,
        //     }}
        //     dragAxis="x"
        //     bounds="parent"
        //     // resizeGrid={[props.snapWidth, 1]}
        //     // dragGrid={[props.snapWidth, 1]}
        //     onDragStart={(event, data) => {

        //     }}
        //     // onDrag={(event, data) => {
        //     // const prevPositionX =
        //     //     props.part.startTime * props.pixelsPerSecond;

        //     // console.log(data.x);
        //     // data.x -= prevDelta.current;

        //     // if (data.x - selectionStartOffsetRef.current < 0) {
        //     //     data.x = selectionStartOffsetRef.current;
        //     // }

        //     // console.log(data.x, timeDelta);
        //     // const startTime = data.x / props.pixelsPerSecond;
        //     // const stopTime =
        //     //     data.x / props.pixelsPerSecond +
        //     //     props.part.stopTime -
        //     //     props.part.startTime;

        //     // setSelectedPartsTime(
        //     //     startTime,
        //     //     stopTime,
        //     //     selectionOffsets.current,
        //     //     selectionStartIndex.current
        //     // );

        //     // setXPos(data.x);
        //     // }}
        //     onDragStop={(event, data) => {
        //         isDraggingRef.current = false;
        //     }}
        //     onResizeStart={(event, data) => {
        //         SelectPart();
        //         prevResizeDeltaRef.current = 0;
        //     }}
        //     onResize={(event, direction, ref, delta, position) => {
        //         const newDelta = delta.width - prevResizeDeltaRef.current;
        //         moveSelectedParts(0, (newDelta + 0.0) / props.pixelsPerSecond);
        //         prevResizeDeltaRef.current = delta.width;
        //     }}
        //     // onResizeStop={(event, data) => {
        //     //     props.onResizeStop();
        //     // }}
        // >
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
                    const newSelectedPartIndices = SelectPart();

                    // const selectionStartTime = GetSelectionStartTime(
                    //     newSelectedPartIndices
                    // );

                    // selectionStartOffsetRef.current =
                    //     (props.part.startTime - selectionStartTime) *
                    //     props.pixelsPerSecond;

                    selectionOffsets.current = GetSelectionStartOffsets(
                        props.part,
                        newSelectedPartIndices
                    );
                    selectionStartIndex.current = GetSelectionStartIndex(
                        newSelectedPartIndices
                    );

                    isDraggingRef.current = true;

                    if (mouse.x !== null) {
                        dragOffset.current = mouse.x - left;
                    }

                    return false;
                    // prevMouseX.current = data.x;
                }}
                cursor="move"
                onDragStart={() => {
                    return false;
                }}
                onDragEnd={() => {
                    return false;
                }}

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

                    isResizingRef.current = true;
                    if (mouse.x !== null) {
                        resizeOffset.current = left + width - mouse.x;
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
