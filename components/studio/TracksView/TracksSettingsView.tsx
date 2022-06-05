import {
    HStack,
    ButtonGroup,
    Icon,
    useDisclosure,
    Menu,
    Text,
    MenuButton,
    MenuDivider,
    MenuItem,
    MenuList,
    MenuOptionGroup,
    NumberDecrementStepper,
    NumberIncrementStepper,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
} from "@chakra-ui/react";
import FileUploader from "@Components/FIleUploader";
import ToggleButton from "@Components/ToggleButton";
import TooltipButton from "@Components/TooltipButton";
import { noteLengthOptions } from "@Data/Constants";
import {
    selectAddInstrumentTrack,
    selectClearSelectedTrack,
    selectDuplicateSelectedTrack,
    useStore,
} from "@Data/Store";
import React from "react";
import { BiTrash, BiMagnet, BiDuplicate, BiChevronDown } from "react-icons/bi";
import { IoMdSave } from "react-icons/io";
import { RiFileAddLine } from "react-icons/ri";
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

    const addInstrumentTrack = useStore(selectAddInstrumentTrack);
    const duplicateSelectedTrack = useStore(selectDuplicateSelectedTrack);

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
                onSubmit={addInstrumentTrack}
            />
        </>
    );
};

export default TracksSettingsView;
