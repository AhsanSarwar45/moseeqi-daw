import { HStack, VStack, Text } from "@chakra-ui/react";
import * as Tone from "tone";

import ToggleButton from "@Components/ToggleButton";
import Meter from "./Meter";
import {
    SetLastSelectedTrackId,
    ToggleTrackMute,
    ToggleTrackSolo,
} from "@Utility/TrackUtils";
import React, { useEffect } from "react";
import { selectLastSelectedTrackId, useStore } from "@Data/Store";
import { Id } from "@Types/Types";
import { Select } from "@Utility/SelectionUtils";
import { SelectionType } from "@Interfaces/Selection";

interface TrackInfoProps {
    trackId: Id;
}

const TrackInfo = (props: TrackInfoProps) => {
    const selectedTrackId = useStore(selectLastSelectedTrackId);
    const isTrackMuted = useStore(
        (state) => state.tracks.get(props.trackId)?.muted as boolean
    );
    const isTrackSoloMuted = useStore(
        (state) => state.tracks.get(props.trackId)?.soloMuted as boolean
    );
    const isTrackSoloed = useStore(
        (state) => state.tracks.get(props.trackId)?.soloed as boolean
    );
    const trackName = useStore(
        (state) => state.tracks.get(props.trackId)?.name as string
    );
    const trackMeter = useStore(
        (state) => state.tracks.get(props.trackId)?.meter as Tone.Meter
    );

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
                Select(props.trackId, SelectionType.Track);
                SetLastSelectedTrackId(props.trackId);
            }}
            // height={200}
            position="relative"
            alignItems="flex-start"
        >
            <VStack alignItems="flex-start">
                <Text color="white">{trackName}</Text>

                <HStack>
                    <ToggleButton
                        tooltipLabel={"Mute"}
                        onClick={() => ToggleTrackMute(props.trackId)}
                        isToggled={isTrackMuted}
                        label="M"
                        borderWidth={1}
                        size="xs"
                        textColor={isTrackSoloMuted ? "secondary.500" : "white"}
                    />
                    <ToggleButton
                        tooltipLabel={"Solo"}
                        onClick={() => ToggleTrackSolo(props.trackId)}
                        isToggled={isTrackSoloed}
                        label="S"
                        borderWidth={1}
                        size="xs"
                    />
                </HStack>
            </VStack>
            <Meter
                width="10px"
                meter={trackMeter}
                bgColor="brand.primary"
                fillColor="brand.accent1"
                borderColor="primary.700"
                borderWidth="1px"
            />
        </HStack>
    );
};

export default TrackInfo;
