
import { Box } from '@chakra-ui/react'
import { Track } from '@Interfaces/Track';
import Ruler from '@scena/react-ruler';
import React, { useEffect, useRef, useState } from 'react'
import PartView from './PartView';

interface TrackProps {
    track: Track;
    trackIndex: number;
    setSelected: (index: number) => void;
    setPartTime: (trackIndex: number, partIndex: number, startTime: number, stopTime: number) => void;

}

const TrackSequence = (props: TrackProps) => {

    const timeScale = useRef<Ruler>(null);
    const timeScaleMain = useRef<Ruler>(null);

    useEffect(() => {
        let timeScaleRefValue: Ruler | null = null;
        let timeScaleMainRefValue: Ruler | null = null;

        window.addEventListener('resize', () => {
            timeScale.current?.resize();
            timeScaleMain.current?.resize();

            timeScaleRefValue = timeScale.current;
            timeScaleMainRefValue = timeScaleMain.current;
        });
        return () => {
            window.removeEventListener('resize', () => {
                timeScaleRefValue?.resize();
                timeScaleMainRefValue?.resize();
            });
        };
    }, []);



    return (

        <Box
            height="88px"
            width={2000}
            position="relative"
            padding="0px"
            onClick={() => props.setSelected(props.trackIndex)}
            borderBottom="1px solid gray"
        >


            {
                props.track.parts.map((part, partIndex) => (
                    <PartView key={partIndex} part={part} trackIndex={props.trackIndex} partIndex={partIndex} setPartTime={props.setPartTime} />
                ))
            }

        </Box >

    )
}

export default TrackSequence

