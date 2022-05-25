import { Box } from "@chakra-ui/react";
import {
    divisionsPerSecond,
    secondsPerWholeNote,
    wholeNoteDivisions,
} from "@Data/Constants";
import useEffectDebugger from "@Debug/UseEffectDebugger";
import { Part } from "@Interfaces/Part";
import { PartSelectionIndex } from "@Interfaces/Selection";
import { Track } from "@Interfaces/Track";
import { BpmToBps } from "@Utility/TimeUtils";
import React, { memo, useContext, useEffect, useRef, useState } from "react";
import { ResizeCallbackData } from "react-resizable";
import { Rnd } from "react-rnd";

interface PartViewProps {
    part: Part;
    partIndex: number;
    trackIndex: number;
    tracks: Array<Track>;
    selectedPartIndices: Array<PartSelectionIndex>;
    onPartClick: (trackIndex: number, partIndex: number) => void;
    onMoveSelectedParts: (startDelta: number, stopDelta: number) => void;
    onMoveSelectedPartsStop: () => void;
    bpm: number;
    pixelsPerSecond: number;
    snapWidth: number;
}

const PartView = ({
    part,
    trackIndex,
    partIndex,
    selectedPartIndices,
    ...props
}: PartViewProps) => {
    const [currentPixelsPerSecond, setCurrentPixelsPerSecond] = useState(
        props.pixelsPerSecond * BpmToBps(props.bpm)
    );

    const [isSelected, setIsSelected] = useState(false);
    const selectionStartOffsetRef = useRef(0);
    const prevResizeDeltaRef = useRef(0);

    useEffect(() => {
        setIsSelected(
            selectedPartIndices.some((partSelectionIndex) => {
                return (
                    partSelectionIndex.partIndex === partIndex &&
                    partSelectionIndex.trackIndex === trackIndex
                );
            })
        );
    }, [partIndex, selectedPartIndices, trackIndex]);

    useEffect(() => {
        setCurrentPixelsPerSecond(props.pixelsPerSecond * BpmToBps(props.bpm));
    }, [props.pixelsPerSecond, props.bpm]);

    const SelectPart = () => {
        props.onPartClick(trackIndex, partIndex);
    };

    return (
        <Rnd
            size={{
                width:
                    currentPixelsPerSecond * (part.stopTime - part.startTime),
                height: "full",
            }}
            enableResizing={{
                top: false,
                right: true,
                bottom: false,
                left: false,
                topRight: false,
                bottomRight: false,
                bottomLeft: false,
                topLeft: false,
            }}
            dragAxis="x"
            bounds="parent"
            resizeGrid={[props.snapWidth, 1]}
            dragGrid={[props.snapWidth, 1]}
            position={{
                x: part.startTime * currentPixelsPerSecond,
                y: 0,
            }}
            onDragStart={(event, data) => {
                SelectPart();

                let selectionStartTime = 2000;

                selectedPartIndices.forEach((partSelectionIndex) => {
                    selectionStartTime = Math.min(
                        selectionStartTime,
                        props.tracks[partSelectionIndex.trackIndex].parts[
                            partSelectionIndex.partIndex
                        ].startTime
                    );
                });

                selectionStartOffsetRef.current =
                    (part.startTime - selectionStartTime) *
                    currentPixelsPerSecond;
            }}
            onDrag={(event, data) => {
                const prevPositionX = part.startTime * currentPixelsPerSecond;

                if (data.x - selectionStartOffsetRef.current < 0) {
                    data.x = selectionStartOffsetRef.current;
                }

                const delta = (data.x - prevPositionX) / currentPixelsPerSecond;

                props.onMoveSelectedParts(delta, delta);
            }}
            onDragStop={(event, data) => {
                props.onMoveSelectedPartsStop();
            }}
            onResizeStart={(event, data) => {
                SelectPart();
                prevResizeDeltaRef.current = 0;
            }}
            onResize={(event, direction, ref, delta, position) => {
                const newDelta = delta.width - prevResizeDeltaRef.current;
                props.onMoveSelectedParts(
                    0,
                    (newDelta + 0.0) / currentPixelsPerSecond
                );

                prevResizeDeltaRef.current = delta.width;
            }}
            onResizeStop={(event, direction, ref, delta, position) => {
                props.onMoveSelectedPartsStop();
            }}
        >
            <Box
                zIndex={-10}
                // marginTop={"-1px"}
                height="89px"
                width="full"
                bgColor="primary.500"
                borderWidth={1}
                borderColor={isSelected ? "brand.secondary" : "white"}
            />
            {part.notes.map((note, index) => (
                <Box
                    zIndex={900}
                    key={note.id}
                    bgColor="secondary.500"
                    position="absolute"
                    top={`${note.keyIndex + 1}px`}
                    left={`${note.startTime * currentPixelsPerSecond}px`}
                    width={`${note.duration * currentPixelsPerSecond}px`}
                    height="1px"
                />
            ))}
        </Rnd>
    );
};

export default memo(PartView);
