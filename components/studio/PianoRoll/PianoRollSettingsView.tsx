import { HStack, ButtonGroup, Icon } from "@chakra-ui/react";
import ToggleButton from "@Components/ToggleButton";
import TooltipButton from "@Components/TooltipButton";
import { noteLengthOptions } from "@Data/Constants";
import { selectClearSelectedTrack, useStore } from "@Data/Store";
import React from "react";
import { BiTrash, BiMagnet } from "react-icons/bi";
import SnapSettings from "../SnapSettings";

interface PianoRollSettingsViewProps {
    isSnappingOn: boolean;
    setIsSnappingOn: (isSnappingOn: boolean) => void;
    snapWidthIndex: number;
    setSnapWidthIndex: (snapWidth: number) => void;
    selectedDrawLengthIndex: number;
    setSelectedDrawLengthIndex: (selectedDrawLengthIndex: number) => void;
}

const PianoRollSettingsView = (props: PianoRollSettingsViewProps) => {
    const clearSelectedTrack = useStore(selectClearSelectedTrack);

    return (
        <HStack
            w="full"
            // height="20px"
            flexShrink={0}
            padding={2}
            spacing={2}
            bg="brand.primary"
            position="sticky"
            left={0}
            boxShadow="md"
            zIndex={10}
        >
            <ButtonGroup
                size="sm"
                isAttached
                variant="solid"
                colorScheme="secondary"
            >
                {noteLengthOptions.map((option, index) => {
                    // const name = value;
                    return (
                        <ToggleButton
                            tooltipLabel={option.name}
                            key={option.name}
                            onClick={() =>
                                props.setSelectedDrawLengthIndex(index)
                            }
                            icon={option.icon}
                            isToggled={index === props.selectedDrawLengthIndex}
                            // borderWidth={0}
                        />
                    );
                })}
            </ButtonGroup>
            <TooltipButton
                aria-label="Clear project"
                onClick={clearSelectedTrack}
                label="Clear"
                icon={<Icon as={BiTrash} />}
                tooltip="Clear all the notes in the piano roll"
            />

            <HStack padding={0} spacing={0}>
                <ToggleButton
                    tooltipLabel={"Snap to grid"}
                    isToggled={props.isSnappingOn}
                    onClick={() => props.setIsSnappingOn(!props.isSnappingOn)}
                    icon={<Icon as={BiMagnet} />}
                />
                <SnapSettings
                    snapWidthIndex={props.snapWidthIndex}
                    setSnapWidthIndex={props.setSnapWidthIndex}
                />
            </HStack>
        </HStack>
    );
};

export default PianoRollSettingsView;
