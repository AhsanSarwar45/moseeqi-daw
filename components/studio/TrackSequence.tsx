
import { HStack, VStack, Box, useTheme, Container } from '@chakra-ui/react'
import { Track } from '@Interfaces/Track';
import Ruler from '@scena/react-ruler';
import React, { useEffect, useRef, useState } from 'react'
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
    const timeScale = useRef<Ruler>(null);
    const timeScaleMain = useRef<Ruler>(null);
    const theme = useTheme();

    useEffect(() => {
        window.addEventListener('resize', () => {
            timeScale.current?.resize();
            timeScaleMain.current?.resize();
        });
        return () => {
            window.removeEventListener('resize', () => {
                timeScale.current?.resize();
                timeScaleMain.current?.resize();
            });
        };
    }, []);

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
            // bgColor="white"
            width={2000}
            padding="0px"
            position="relative"
            onClick={() => props.setSelected(props.index)}
            // onDoubleClick={() => props.setStopTime(props.track.stopTime)}
            borderBottom="1px solid gray"
        >
            <Box position="absolute" right={0} top={0} width={2000} p={0}>
                <Ruler type="horizontal" unit={1} zoom={40} ref={timeScale} backgroundColor={theme.colors.primary[400]} segment={4} height={86} mainLineSize={0} shortLineSize={86} longLineSize={86} lineColor='rgba(255,255,255,0.1)' textColor='rgba(0,0,0,0)' />
            </Box>
            <Box position="absolute" right={0} top={0} width={2000} p={0}>
                <Ruler type="horizontal" unit={1} zoom={40} ref={timeScaleMain} backgroundColor='rgba(0,0,0,0)' segment={1} height={86} lineColor='rgba(255,255,255,0.3)' textColor='rgba(0,0,0,0)' />
            </Box>

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
                <Box height="86px" width="full" overflow="hidden" bgColor="primary.500">
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
        </Box >

    )
}

export default TrackSequence

