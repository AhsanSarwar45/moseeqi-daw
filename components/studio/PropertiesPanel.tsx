import React, { useState } from "react";
import { Heading, VStack, Flex } from "@chakra-ui/react";

import KnobControl from "@Components/Knob";
import {
    selectSelectedTrack,
    selectSetSelectedTrackAttack,
    selectSetSelectedTrackRelease,
    selectTrackCount,
    useTracksStore,
} from "@Data/TracksStore";

interface PropertiesPanelProps {}

export const PropertiesPanel = (props: PropertiesPanelProps) => {
    const trackCount = useTracksStore(selectTrackCount);
    const selectedTrack = useTracksStore(selectSelectedTrack);

    const setSelectedTrackAttack = useTracksStore(selectSetSelectedTrackAttack);
    const setSelectedTrackRelease = useTracksStore(
        selectSetSelectedTrackRelease
    );

    return (
        <VStack
            padding="10px"
            bgColor="primary.700"
            height="100%"
            spacing="10px"
        >
            <Heading width="100%" color="white" size="md">
                Properties
            </Heading>
            {trackCount > 0 ? (
                <VStack spacing={5} width="100%">
                    <Heading width="100%" size="sm" color="white">
                        Envelope
                    </Heading>

                    <Flex width="100%">
                        <KnobControl
                            size={50}
                            label="Attack"
                            setValue={(value) => setSelectedTrackAttack(value)}
                            defaultVal={selectedTrack.sampler.attack as number}
                            //defaultVal={0}
                        />
                        <KnobControl
                            size={50}
                            label="Release"
                            setValue={(value) => setSelectedTrackRelease(value)}
                            defaultVal={selectedTrack.sampler.release as number}
                            //defaultVal={1}
                        />
                    </Flex>
                </VStack>
            ) : null}
        </VStack>
    );
};
