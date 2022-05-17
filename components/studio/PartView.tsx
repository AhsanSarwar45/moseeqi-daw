import { Box } from "@chakra-ui/react";
import { PlaybackContext } from "@Data/PlaybackContext";
import useEffectDebugger from "@Debug/UseEffectDebugger";
import { Part } from "@Interfaces/Part";
import { PartSelectionIndex } from "@Interfaces/Selection";
import { BpmToBps } from "@Utility/TimeUtils";
import React, { memo, useContext, useEffect, useState } from "react";
import { ResizeCallbackData } from "react-resizable";
import { Rnd } from "react-rnd";

interface PartViewProps {
    part: Part;
    partIndex: number;
    trackIndex: number;
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
                width: secondWidth * (part.stopTime - part.startTime) + 1,
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
            }}
            onResizeStart={(event, data) => {
                SelectPart();
            }}
            onDrag={(e, data) => {
                const prevPositionX = part.startTime * secondWidth;

                const positionX = Math.round(data.x / snapWidth) * snapWidth;
                const delta = (positionX - prevPositionX) / secondWidth;
                props.onMoveSelectedParts(delta, delta);
            }}
            onDragStop={(e, data) => {
                props.onMoveSelectedPartsStop();
            }}
            onResizeStop={(e, direction, ref, delta, position) => {
                props.onMoveSelectedParts(0, (delta.width + 1) / secondWidth);
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
