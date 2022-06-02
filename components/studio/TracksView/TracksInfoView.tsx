import React from "react";

import {
    selectSelectedTrackIndex,
    selectSetSelectedTrackIndex,
    selectToggleMuteAtIndex,
    selectToggleSoloAtIndex,
    selectTracks,
    useTracksStore,
} from "@Data/TracksStore";
import { Track } from "@Interfaces/Track";
import { HStack, VStack, Text } from "@chakra-ui/react";
import Meter from "./Meter";
import ToggleButton from "@Components/ToggleButton";

interface TracksInfoViewProps {}

const TracksInfoView = () => {
    const tracks = useTracksStore(selectTracks);
    const selectedTrackIndex = useTracksStore(selectSelectedTrackIndex);
    const setSelectedTrackIndex = useTracksStore(selectSetSelectedTrackIndex);
    const toggleMuteAtIndex = useTracksStore(selectToggleMuteAtIndex);
    const toggleSoloAtIndex = useTracksStore(selectToggleSoloAtIndex);

    return (
        <>
            {tracks.map((track: Track, index: number) => (
                <HStack
                    key={index}
                    color="white"
                    paddingY={2}
                    paddingX={2}
                    width={200}
                    height={90}
                    bgColor={
                        selectedTrackIndex === index
                            ? "primary.700"
                            : "primary.500"
                    }
                    boxSizing="border-box"
                    borderBottomWidth={1}
                    borderColor={"gray.500"}
                    onMouseDown={(event) => {
                        setSelectedTrackIndex(index);
                    }}
                    // height={200}
                    position="relative"
                    alignItems="flex-start"
                >
                    <VStack alignItems="flex-start">
                        <Text color="white">{track.name}</Text>

                        <HStack>
                            <ToggleButton
                                tooltipLabel={"Mute"}
                                onClick={() => toggleMuteAtIndex(index)}
                                isToggled={track.muted}
                                label="M"
                                borderWidth={1}
                                size="xs"
                                textColor={
                                    track.soloMuted ? "secondary.500" : "white"
                                }
                            />
                            <ToggleButton
                                tooltipLabel={"Solo"}
                                onClick={() => toggleSoloAtIndex(index)}
                                isToggled={track.soloed}
                                label="S"
                                borderWidth={1}
                                size="xs"
                            />
                        </HStack>
                    </VStack>
                    <Meter
                        width="10px"
                        meter={track.meter}
                        bgColor="brand.primary"
                        fillColor="brand.accent1"
                        borderColor="primary.700"
                        borderWidth="1px"
                    />
                </HStack>
            ))}
        </>
    );
};

export default TracksInfoView;
