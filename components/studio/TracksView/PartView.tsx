import { Box } from "@chakra-ui/react";
import React, { memo, useContext, useEffect, useRef, useState } from "react";
import { Rnd } from "react-rnd";
import useMouse from "@react-hook/mouse-position";

import {
    selectMoveSelectedParts,
    selectSetSelectedPartsIndices,
    selectSetSelectedPartsTime,
    useTracksStore,
} from "@Data/TracksStore";
import { Part } from "@Interfaces/Part";
import {
    GetSelectionOffsets,
    GetSelectionStartIndex,
    GetSelectionStartTime,
    IsPartSelected,
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
    const prevDelta = useRef(0);

    const dragOffset = useRef(0);

    const prevMouse = useRef<number | null>(0);

    const partRef = useRef<HTMLElement>(null);
    const parentRef = useRef<HTMLElement | null>(null);

    const mouse = useMouse(parentRef, {
        enterDelay: 100,
        leaveDelay: 100,
    });

    // const [xPos, setXPos] = useState(
    //     props.part.startTime * props.pixelsPerSecond
    // );

    const moveSelectedParts = useTracksStore(selectMoveSelectedParts);
    const setSelectedPartsTime = useTracksStore(selectSetSelectedPartsTime);
    const setSelectedPartsIndices = useTracksStore(
        selectSetSelectedPartsIndices
    );

    useEffect(() => {
        if (partRef.current) {
            parentRef.current = partRef.current.parentNode as HTMLElement;
            console.log(parentRef.current);
        }
    }, []);

    const SelectPart = (): Array<PartSelectionIndex> => {
        return setSelectedPartsIndices(
            props.trackIndex,
            props.partIndex,
            props.isShiftHeld
        );
    };

    const width =
        props.pixelsPerSecond * (props.part.stopTime - props.part.startTime);

    useEffect(() => {
        window.addEventListener("mouseup", () => {
            isDraggingRef.current = false;
        });
        return () => {
            window.removeEventListener("mouseup", () => {});
        };
    }, []);

    useEffect(() => {
        if (isDraggingRef.current) {
            if (mouse.x !== null && prevMouse.current !== null) {
                let pos = mouse.x - dragOffset.current;
                pos = Snap(pos, props.snapWidth);

                const startTime = pos / props.pixelsPerSecond;
                const stopTime =
                    pos / props.pixelsPerSecond +
                    props.part.stopTime -
                    props.part.startTime;

                setSelectedPartsTime(
                    startTime,
                    stopTime,
                    selectionOffsets.current,
                    selectionStartIndex.current
                );

                // const delta = mouse.x - prevMouse.current;

                // const timeDelta = delta / props.pixelsPerSecond;

                // console.log(`${mouse.x}, ${mouse.y}`);

                // moveSelectedParts(timeDelta, timeDelta);
            }

            prevMouse.current = mouse.x;
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
            left={`${props.part.startTime * props.pixelsPerSecond}px`}
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
                onMouseDown={() => {
                    console.log("mouse down");
                    const newSelectedPartIndices = SelectPart();

                    // const selectionStartTime = GetSelectionStartTime(
                    //     newSelectedPartIndices
                    // );

                    // selectionStartOffsetRef.current =
                    //     (props.part.startTime - selectionStartTime) *
                    //     props.pixelsPerSecond;

                    selectionOffsets.current = GetSelectionOffsets(
                        props.part,
                        newSelectedPartIndices
                    );
                    selectionStartIndex.current = GetSelectionStartIndex(
                        newSelectedPartIndices
                    );

                    isDraggingRef.current = true;
                    prevMouse.current = mouse.x;

                    if (mouse.x !== null) {
                        dragOffset.current =
                            mouse.x -
                            props.part.startTime * props.pixelsPerSecond;
                    }
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
                left={`${width - 2}px`}
                width={`${2}px`}
                height="full"
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
