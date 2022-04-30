import React, { useState } from "react";
import {
    ButtonGroup,
    Button,
    HStack,
    Heading,
    VStack,
    Flex,
} from "@chakra-ui/react";
import KnobControl from "components/Knob";
import { Track } from "@Interfaces/Track";

interface PropertiesPanelProps {
    numTracks: number;
    selectedTrack: Track;
    setAttack: (value: number) => void;
    setRelease: (value: number) => void;
}

export const PropertiesPanel = (props: PropertiesPanelProps) => {
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
            {props.numTracks > 0 ? (
                <VStack spacing={5} width="100%">
                    <Heading width="100%" size="sm" color="white">
                        Envelope
                    </Heading>

                    <Flex width="100%">
                        <KnobControl
                            size={50}
                            label="Attack"
                            setValue={props.setAttack}
                            defaultVal={
                                props.selectedTrack.sampler.attack as number
                            }
                            //defaultVal={0}
                        />
                        <KnobControl
                            size={50}
                            label="Release"
                            setValue={props.setRelease}
                            defaultVal={
                                props.selectedTrack.sampler.release as number
                            }
                            //defaultVal={1}
                        />
                    </Flex>
                </VStack>
            ) : null}
        </VStack>
    );
};
