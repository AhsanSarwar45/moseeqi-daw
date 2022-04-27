import { Box } from '@chakra-ui/react';
import { Part } from '@Interfaces/Part';
import React, { useEffect, useState } from 'react'
import { ResizeCallbackData } from 'react-resizable';
import { Rnd } from 'react-rnd';

interface PartViewProps {
    part: Part;
    partIndex: number;
    trackIndex: number;
    setStopTime: (time: number) => void;
    setPartTime: (trackIndex: number, partIndex: number, startTime: number, stopTime: number) => void;
}

const PartView = (props: PartViewProps) => {
    const [activeWidth, setActiveWidth] = useState(5 * 40);
    const [position, setPosition] = useState({ x: props.part.startTime * 20, y: 0 });

    useEffect(() => {
        console.log(
            "Hello"
        )
    }, []);

    return (
        // <Box height="full" bgColor="red.500" width="100px">


        // </Box>
        <Rnd
            size={{ width: activeWidth, height: "full" }}
            enableResizing={{ top: false, right: true, bottom: false, left: false, topRight: false, bottomRight: false, bottomLeft: false, topLeft: false }}
            dragAxis="x"
            bounds="parent"
            resizeGrid={[5, 5]}
            dragGrid={[5, 5]}
            position={position}
            onDragStop={(e, d) => {

                const positionX = Math.round(d.x / 5) * 5
                // console.log(position);
                setPosition({ x: positionX, y: d.y });
                props.setPartTime(props.trackIndex, props.partIndex, positionX / 20, (positionX + activeWidth) / 20);
            }}
            onResizeStop={(e, direction, ref, delta, position) => {
                const width = parseInt(ref.style.width)
                setActiveWidth(width);

                // console.log("width", width, "position", position);
                const positionX = Math.round(position.x / 5) * 5
                props.setPartTime(props.trackIndex, props.partIndex, positionX / 20, (positionX + width) / 20);


            }}
        >
            {/* <Box height="86px" width="full" bgColor="red.500" /> */}

            {/* </Box> */}
            <Box height="86px" width="full" overflow="hidden" bgColor="primary.500" borderWidth={1}>
                {props.part.notes.map((note, index) => (
                    <Box
                        key={index}
                        bgColor="secondary.500"
                        position="absolute"
                        top={`${note.noteIndex}px`}
                        left={`${5 * note.time}px`}
                        width={`${5 * 8 / note.duration}px`}
                        height="1px"
                    />
                ))}
            </Box>
        </Rnd>
    )
}

export default PartView;