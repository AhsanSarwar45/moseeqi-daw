import { HStack, Icon, useDisclosure } from "@chakra-ui/react";
import ToggleButton from "@Components/ToggleButton";
import TooltipButton from "@Components/TooltipButton";
import { useStore } from "@data/stores/project";
import {
    addTrackFromInstrumentIndex,
    duplicateSelectedTracks,
} from "@logic/track";
import React from "react";
import { BiTrash, BiMagnet, BiDuplicate, BiChevronDown } from "react-icons/bi";
import { TiFolderOpen, TiPlus } from "react-icons/ti";
import SnapSettings from "../SnapSettings";
import { AddTrackModal } from "./AddTrackModal";

interface TracksSettingsViewProps {
    snapWidthIndex: number;
    setSnapWidthIndex: (snapWidth: number) => void;
    isSnappingOn: boolean;
    setIsSnappingOn: (isSnappingOn: boolean) => void;
}

const TracksSettingsView = (props: TracksSettingsViewProps) => {
    const { isOpen, onOpen, onClose } = useDisclosure();

    return (
        <>
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
                zIndex={997}
            >
                <TooltipButton
                    aria-label="Add track"
                    onClick={onOpen}
                    label=""
                    icon={<Icon as={TiPlus} />}
                    tooltip="Add track"
                />
                <TooltipButton
                    aria-label="Duplicate track"
                    onClick={duplicateSelectedTracks}
                    label=""
                    icon={<Icon as={BiDuplicate} />}
                    tooltip="Duplicate selected track"
                />
                <HStack padding={0} spacing={0}>
                    <ToggleButton
                        tooltipLabel={"Snap to grid"}
                        isToggled={props.isSnappingOn}
                        onClick={() =>
                            props.setIsSnappingOn(!props.isSnappingOn)
                        }
                        icon={<Icon as={BiMagnet} />}
                    />
                    <SnapSettings
                        snapWidthIndex={props.snapWidthIndex}
                        setSnapWidthIndex={props.setSnapWidthIndex}
                    />
                </HStack>
            </HStack>
            <AddTrackModal
                onClose={onClose}
                isOpen={isOpen}
                onSubmit={addTrackFromInstrumentIndex}
            />
        </>
    );
};

export default TracksSettingsView;
