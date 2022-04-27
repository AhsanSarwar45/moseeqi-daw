
import { HStack, VStack, Box, useTheme, Container } from '@chakra-ui/react'
import { Track } from '@Interfaces/Track';
import Ruler from '@scena/react-ruler';
import React, { useEffect, useRef, useState } from 'react'
import Draggable, { DraggableData, DraggableEvent } from 'react-draggable';
import { Resizable, ResizeCallbackData } from 'react-resizable'
import { Rnd } from 'react-rnd'
import PartView from './PartView';

interface TrackProps {
    track: Track;
    trackIndex: number;
    setSelected: (index: number) => void;
    setStopTime: (time: number) => void;
    setPartTime: (trackIndex: number, partIndex: number, startTime: number, stopTime: number) => void;

}

const TrackSequence = (props: TrackProps) => {

    const timeScale = useRef<Ruler>(null);
    const timeScaleMain = useRef<Ruler>(null);
    const theme = useTheme();

    useEffect(() => {
        console.log(props.track)
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



    return (

        <Box
            height="88px"
            // bgColor="white"
            width={2000}
            padding="0px"
            position="relative"
            onClick={() => props.setSelected(props.trackIndex)}
            // onDoubleClick={() => props.setStopTime(props.track.stopTime)}
            borderBottom="1px solid gray"
        >
            <Box position="absolute" right={0} top={0} width={2000} p={0}>
                <Ruler type="horizontal" unit={1} zoom={40} ref={timeScale} backgroundColor={theme.colors.primary[400]} segment={4} height={86} mainLineSize={0} shortLineSize={86} longLineSize={86} lineColor='rgba(255,255,255,0.1)' textColor='rgba(0,0,0,0)' />
            </Box>
            <Box position="absolute" right={0} top={0} width={2000} p={0}>
                <Ruler type="horizontal" unit={1} zoom={40} ref={timeScaleMain} backgroundColor='rgba(0,0,0,0)' segment={1} height={86} lineColor='rgba(255,255,255,0.3)' textColor='rgba(0,0,0,0)' />
            </Box>

            {
                props.track.parts.map((part, partIndex) => (
                    <PartView key={partIndex} part={part} trackIndex={props.trackIndex} partIndex={partIndex} setStopTime={props.setStopTime} setPartTime={props.setPartTime} />
                ))
            }

        </Box >

    )
}

export default TrackSequence

