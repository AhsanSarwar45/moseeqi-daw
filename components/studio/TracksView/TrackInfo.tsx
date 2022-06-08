import { HStack, VStack, Text } from "@chakra-ui/react";
import ToggleButton from "@Components/ToggleButton";
import Meter from "./Meter";
import {
    SetSelectedTrackIndex,
    ToggleTrackMute,
    ToggleTrackSolo,
} from "@Utility/TrackUtils";
import React, { useEffect } from "react";
import { selectSelectedTrackIndex, useStore } from "@Data/Store";

interface TrackInfoProps {
    index: number;
}

const TrackInfo = (props: TrackInfoProps) => {
    const selectedTrackIndex = useStore(selectSelectedTrackIndex);
    const isTrackMuted = useStore((state) => state.tracks[props.index].muted);
    const isTrackSoloMuted = useStore(
        (state) => state.tracks[props.index].soloMuted
    );
    const isTrackSoloed = useStore((state) => state.tracks[props.index].soloed);
    const trackName = useStore((state) => state.tracks[props.index].name);
    const trackMeter = useStore((state) => state.tracks[props.index].meter);

    return (
        <HStack
            color="white"
            paddingY={2}
            paddingX={2}
            width={200}
            height={90}
            bgColor={
                selectedTrackIndex === props.index
                    ? "primary.700"
                    : "primary.500"
            }
            boxSizing="border-box"
            borderBottomWidth={1}
            borderColor={"gray.500"}
            onMouseDown={(event) => {
                SetSelectedTrackIndex(props.index);
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
                        onClick={() => ToggleTrackMute(props.index)}
                        isToggled={isTrackMuted}
                        label="M"
                        borderWidth={1}
                        size="xs"
                        textColor={isTrackSoloMuted ? "secondary.500" : "white"}
                    />
                    <ToggleButton
                        tooltipLabel={"Solo"}
                        onClick={() => ToggleTrackSolo(props.index)}
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
