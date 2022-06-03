import { HStack, ButtonGroup, Icon, useDisclosure } from "@chakra-ui/react";
import TooltipButton from "@Components/TooltipButton";
import {
    selectAddInstrumentTrack,
    selectClearSelectedTrack,
    selectDuplicateSelectedTrack,
    useTracksStore,
} from "@Data/TracksStore";
import React from "react";
import { BiTrash, BiMagnet, BiDuplicate } from "react-icons/bi";
import { TiPlus } from "react-icons/ti";
import { AddTrackModal } from "./AddTrackModal";

interface TracksSettingsViewProps {}

const TracksSettingsView = (props: TracksSettingsViewProps) => {
    const { isOpen, onOpen, onClose } = useDisclosure();

    const addInstrumentTrack = useTracksStore(selectAddInstrumentTrack);
    const duplicateSelectedTrack = useTracksStore(selectDuplicateSelectedTrack);

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
                    onClick={duplicateSelectedTrack}
                    label=""
                    icon={<Icon as={BiDuplicate} />}
                    tooltip="Duplicate selected track"
                />
            </HStack>
            <AddTrackModal
                onClose={onClose}
                isOpen={isOpen}
                onSubmit={addInstrumentTrack}
            />
        </>
    );
};

export default TracksSettingsView;
