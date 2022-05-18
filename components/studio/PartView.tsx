import { Box } from "@chakra-ui/react";
import { PlaybackContext } from "@Data/PlaybackContext";
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
    setPartTime: (
        trackIndex: number,
        partIndex: number,
        startTime: number,
        stopTime: number
    ) => void;
    selectedPartIndices: Array<PartSelectionIndex>;
    onPartClick: (trackIndex: number, partIndex: number) => void;
    onMoveSelectedParts: (startDelta: number, stopDelta: number) => void;
    onMoveSelectedPartsStop: () => void;
}

const PartView = ({
    part,
    trackIndex,
    partIndex,
    setPartTime,
    selectedPartIndices,
    ...props
}: PartViewProps) => {
    const { bpm } = useContext(PlaybackContext);

    const wholeNoteWidth = 40;
    const [secondWidth, setSecondWidth] = useState(
        wholeNoteWidth / (4 / BpmToBps(bpm))
    );
    const snapDivisions = 8;
    const noteDivisions = 8;
    const snapWidth = wholeNoteWidth / snapDivisions;
    const smallestNoteWidth = wholeNoteWidth / noteDivisions;

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
        const newSecondWidth = wholeNoteWidth / (4 / (bpm / 60));
        setSecondWidth(newSecondWidth);
        // setPartTime(
        //     trackIndex,
        //     partIndex,
        //     part.startTime / newSecondWidth,
        //     (part.startTime + width) / newSecondWidth
        // );
    }, [bpm]);

    const SelectPart = () => {
        props.onPartClick(trackIndex, partIndex);
    };

    return (
        <Rnd
            size={{
                width: secondWidth * (part.stopTime - part.startTime),
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
            resizeGrid={[snapWidth, snapWidth]}
            dragGrid={[snapWidth, snapWidth]}
            position={{
                x: part.startTime * secondWidth,
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
                    (part.startTime - selectionStartTime) * secondWidth;
            }}
            onDrag={(event, data) => {
                const prevPositionX = part.startTime * secondWidth;

                if (data.x - selectionStartOffsetRef.current < 0) {
                    data.x = selectionStartOffsetRef.current;
                }

                const delta = (data.x - prevPositionX) / secondWidth;

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
                props.onMoveSelectedParts(0, (newDelta + 0.0) / secondWidth);

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
                    key={index}
                    bgColor="secondary.500"
                    position="absolute"
                    top={`${note.noteIndex + 1}px`}
                    left={`${smallestNoteWidth * note.startColumn}px`}
                    width={`${
                        (smallestNoteWidth * noteDivisions) / note.duration
                    }px`}
                    height="1px"
                />
            ))}
        </Rnd>
    );
};

export default memo(PartView);
