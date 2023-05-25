import React, { useState } from "react";
import { Heading, VStack, Flex } from "@chakra-ui/react";

import KnobControl from "@Components/Knob";
import {
    selectSelectedTrack,
    selectTrackCount,
    useStore,
} from "@data/stores/project";

interface PropertiesPanelProps {}

const PropertiesPanel = (props: PropertiesPanelProps) => {
    const trackCount = useStore(selectTrackCount);
    const selectedTrack = useStore(selectSelectedTrack);

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
                            setValue={() => {}}
                            defaultVal={selectedTrack.sampler.attack as number}
                            //defaultVal={0}
                        />
                        <KnobControl
                            size={50}
                            label="Release"
                            setValue={() => {}}
                            defaultVal={selectedTrack.sampler.release as number}
                            //defaultVal={1}
                        />
                    </Flex>
                </VStack>
            ) : null}
        </VStack>
    );
};

export default PropertiesPanel;
