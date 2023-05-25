import { HStack, VStack, Text } from "@chakra-ui/react";
import * as Tone from "tone";

import ToggleButton from "@Components/ToggleButton";
import Meter from "./Meter";
import {
    setLastSelectedTrackId,
    toggleTrackMute,
    toggleTrackSolo,
} from "@logic/track";
import React, { useEffect } from "react";
import { selectLastSelectedTrackId, useStore } from "@data/stores/project";
import { Id } from "@Types/Types";
import { select } from "@logic/selection";
import { SelectionType } from "@Interfaces/Selection";
import { Track } from "@Interfaces/Track";

interface TrackInfoProps {
    trackId: Id;
    track: Track;
}

const TrackInfo = (props: TrackInfoProps) => {
    const selectedTrackId = useStore(selectLastSelectedTrackId);
    // const isTrackMuted = useStore(
    //     (state) => state.tracks.get(props.trackId)?.muted as boolean
    // );
    // const isTrackSoloMuted = useStore(
    //     (state) => state.tracks.get(props.trackId)?.soloMuted as boolean
    // );
    // const isTrackSoloed = useStore(
    //     (state) => state.tracks.get(props.trackId)?.soloed as boolean
    // );
    // const trackName = useStore(
    //     (state) => state.tracks.get(props.trackId)?.name as string
    // );
    // const trackMeter = useStore(
    //     (state) => state.tracks.get(props.trackId)?.meter as Tone.Meter
    // );
    // const trackInstrument = useStore(
    //     (state) => state.tracks.get(props.trackId)?.instrument.name as String
    // );

    // console.log(trackInstrument);

    return (
        <HStack
            color="white"
            paddingY={2}
            paddingX={2}
            width={200}
            height={90}
            bgColor={
                selectedTrackId === props.trackId
                    ? "primary.700"
                    : "primary.500"
            }
            boxSizing="border-box"
            borderBottomWidth={1}
            borderColor={"gray.500"}
            onMouseDown={(event) => {
                select(props.trackId, SelectionType.Track);
                setLastSelectedTrackId(props.trackId);
            }}
            // height={200}
            position="relative"
            alignItems="flex-start"
        >
            <VStack alignItems="flex-start">
                <Text color="white">{props.track.name}</Text>

                <HStack>
                    <ToggleButton
                        tooltipLabel={"Mute"}
                        onClick={() => toggleTrackMute(props.trackId)}
                        isToggled={props.track.muted}
                        label="M"
                        borderWidth={1}
                        size="xs"
                        textColor={
                            props.track.soloMuted ? "secondary.500" : "white"
                        }
                    />
                    <ToggleButton
                        tooltipLabel={"Solo"}
                        onClick={() => toggleTrackSolo(props.trackId)}
                        isToggled={props.track.soloed}
                        label="S"
                        borderWidth={1}
                        size="xs"
                    />
                </HStack>
            </VStack>
            <Meter
                width="10px"
                meter={props.track.meter}
                bgColor="brand.primary"
                fillColor="brand.accent1"
                borderColor="primary.700"
                borderWidth="1px"
            />
        </HStack>
    );
};

export default TrackInfo;
