import { HStack, Icon, useDisclosure } from "@chakra-ui/react";
import { TiPlus, TiVolumeMute } from "react-icons/ti";
import { BiDuplicate } from "react-icons/bi";

import TooltipButton from "@Components/TooltipButton";
import { AddTrackModal } from "./AddTrackModal";
import {
    selectAddInstrumentTrack,
    selectDuplicateSelectedTrack,
    useTracksStore,
} from "@Data/TracksStore";
import { useEffect } from "react";

const TracksEditBar = () => {
    const { isOpen, onOpen, onClose } = useDisclosure();

    const addInstrumentTrack = useTracksStore(selectAddInstrumentTrack);
    const duplicateSelectedTrack = useTracksStore(selectDuplicateSelectedTrack);

    return (
        <>
            <HStack
                paddingX={1}
                height={30}
                // width="full"
                spacing={1}
                justifyContent="flex-start"
                bgColor="primary.500"
                borderBottom="1px solid gray"
                position="sticky"
                top={0}
                left={0}
                width={200}
                zIndex={9300}
            >
                <TooltipButton
                    aria-label="Add track"
                    onClick={onOpen}
                    label=""
                    icon={<Icon as={TiPlus} />}
                    tooltip="Add track"
                    fontSize="xs"
                    size="xs"
                />
                <TooltipButton
                    aria-label="Duplicate track"
                    onClick={duplicateSelectedTrack}
                    label=""
                    icon={<Icon as={BiDuplicate} />}
                    tooltip="Duplicate selected track"
                    fontSize="xs"
                    size="xs"
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

export default TracksEditBar;
