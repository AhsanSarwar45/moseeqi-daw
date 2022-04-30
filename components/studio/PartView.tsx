import { Box } from '@chakra-ui/react';
import { PlaybackContext } from '@Data/PlaybackContext';
import useEffectDebugger from '@Debug/UseEffectDebugger';
import { Part } from '@Interfaces/Part';
import React, { useContext, useEffect, useState } from 'react'
import { ResizeCallbackData } from 'react-resizable';
import { Rnd } from 'react-rnd';

interface PartViewProps {
    part: Part;
    partIndex: number;
    trackIndex: number;
    setStopTime: (time: number) => void;
    setPartTime: (trackIndex: number, partIndex: number, startTime: number, stopTime: number) => void;
}

const PartView = ({ trackIndex, partIndex, setPartTime, ...props }: PartViewProps) => {
    const { bpm } = useContext(PlaybackContext)

    const wholeNoteWidth = 40;
    const [secondWidth, setSecondWidth] = useState(wholeNoteWidth / (4 / (bpm / 60)));
    const snapDivisions = 8;
    const noteDivisions = 8;
    const snapWidth = wholeNoteWidth / snapDivisions;
    const smallestNoteWidth = wholeNoteWidth / noteDivisions;

    const [width, setWidth] = useState(secondWidth * (props.part.stopTime - props.part.startTime));
    const [position, setPosition] = useState({ x: props.part.startTime * secondWidth, y: 0 });

    useEffect(() => {
        const newSecondWidth = wholeNoteWidth / (4 / (bpm / 60))
        setPartTime(trackIndex, partIndex, position.x / newSecondWidth, (position.x + width) / newSecondWidth);
        setSecondWidth(newSecondWidth);
    }, [position, width, bpm])

    return (
        <Rnd

            size={{ width: width, height: "full" }}
            enableResizing={{ top: false, right: true, bottom: false, left: false, topRight: false, bottomRight: false, bottomLeft: false, topLeft: false }}
            dragAxis="x"
            bounds="parent"
            resizeGrid={[snapWidth, snapWidth]}
            dragGrid={[snapWidth, snapWidth]}
            position={position}
            onDragStop={(e, d) => {
                const positionX = Math.round(d.x / snapWidth) * snapWidth
                // console.log(position);
                setPosition({ x: positionX, y: d.y });

            }}
            onResizeStop={(e, direction, ref, delta, position) => {
                const width = parseInt(ref.style.width)
                setWidth(width);

                // console.log("width", width, "position", position);
                // const positionX = Math.round(position.x / snapWidth) * snapWidth
                // setSecondWidth(wholeNoteWidth / (4 / (bpm / 60)));
            }}
        >
            <Box zIndex={-10} marginTop={"-1px"} height="89px" width="full" bgColor="primary.500" borderWidth={1} />
            {props.part.notes.map((note, index) => (
                <Box
                    zIndex={900}
                    key={index}
                    bgColor="secondary.500"
                    position="absolute"
                    top={`${note.noteIndex}px`}
                    left={`${smallestNoteWidth * note.startColumn}px`}
                    width={`${smallestNoteWidth * noteDivisions / note.duration}px`}
                    height="1px"
                />
            ))}
        </Rnd>
    )
}

export default PartView;