
import { HStack, VStack, Box } from '@chakra-ui/react'
import { Track } from '@Interfaces/Track';
import React, { useRef, useState } from 'react'
import Draggable, { DraggableData, DraggableEvent } from 'react-draggable';
import { Resizable, ResizeCallbackData } from 'react-resizable'
import { Rnd } from 'react-rnd'

interface TrackProps {
    track: Track;
    index: number;
    setSelected: (index: number) => void;
    setStopTime: (time: number) => void;
    setPartTime: (partIndex: number, startTime: number, stopTime: number) => void;

}

const TrackSequence = (props: TrackProps) => {
    const [activeWidth, setActiveWidth] = useState(5 * 40);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    const OnSetActiveWidth = (e: React.SyntheticEvent<Element, Event>, data: ResizeCallbackData) => {
        // console.log(data.size.width);
        setActiveWidth(data.size.width);
    };

    const OnResizeStop = (e: React.SyntheticEvent<Element, Event>, data: ResizeCallbackData) => {
        props.setStopTime(data.size.width / 20);
    };

    return (

        <Box
            height="88px"
            color="white"
            width="full"
            bgColor="primary.400"
            padding="0px"
            position="relative"
            onClick={() => props.setSelected(props.index)}
            borderBottom="1px solid gray"
        >
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
                    props.setPartTime(props.index, positionX / 20, (positionX + activeWidth) / 20);
                }}
                onResizeStop={(e, direction, ref, delta, position) => {
                    const width = parseInt(ref.style.width)
                    setActiveWidth(width);

                    // console.log("width", width, "position", position);
                    const positionX = Math.round(position.x / 5) * 5
                    props.setPartTime(props.index, positionX / 20, (positionX + width) / 20);


                }}
            >
                {/* <Box height="86px" width="full" bgColor="red.500" /> */}

                {/* </Box> */}
                <Box height="86px" width="full" overflow="hidden" bgColor="primary.500" >
                    {props.track.notes.map((note, index) => (
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
            {/* <Draggable
                axis="x"
                handle=".handle"
                defaultPosition={{ x: 0, y: 0 }}
                // position={dragging.current ? null as any : { x: seek * 5 * props.scale, y: 0 }}
                grid={[5, 5]}
                scale={1}
                bounds={{ left: 0, right: 10000 }}
                onStart={(props: any) => {
                    console.log('start')
                    dragging.current = true;
                }}
                onStop={HandleDrag}
                nodeRef={seekHandleRef}
            >
                <Resizable

                    height={1}
                    width={activeWidth}
                    onResize={OnSetActiveWidth}
                    onResizeStop={OnResizeStop}
                    axis="x"
                    draggableOpts={{ grid: [5, 5] }}
                    resizeHandles={['e']}
                >

                    <Box ref={seekHandleRef} height="full" width={activeWidth} overflow="hidden" bgColor="primary.500">
                        {props.track.notes.map((note, index) => (
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

                </Resizable>
            </Draggable> */}
        </Box >

    )
}

export default TrackSequence

