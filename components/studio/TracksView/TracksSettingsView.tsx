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
    useTracksStore,
} from "@Data/TracksStore";
import React from "react";
import { BiTrash, BiMagnet, BiDuplicate, BiChevronDown } from "react-icons/bi";
import { IoMdSave } from "react-icons/io";
import { RiFileAddLine } from "react-icons/ri";
import { TiFolderOpen, TiPlus } from "react-icons/ti";
import { AddTrackModal } from "./AddTrackModal";

interface TracksSettingsViewProps {
    snapWidthIndex: number;
    setSnapWidthIndex: (snapWidth: number) => void;
    isSnappingOn: boolean;
    setIsSnappingOn: (isSnappingOn: boolean) => void;
}

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
                <HStack padding={0} spacing={0}>
                    <ToggleButton
                        tooltipLabel={"Snap to grid"}
                        isToggled={props.isSnappingOn}
                        onClick={() =>
                            props.setIsSnappingOn(!props.isSnappingOn)
                        }
                        icon={<Icon as={BiMagnet} />}
                    />
                    <Menu colorScheme="primary">
                        <MenuButton
                            textColor="text.primary"
                            borderWidth={1}
                            borderRightRadius="sm"
                            borderLeftWidth={0}
                            borderColor="secondary.500"
                            height="2rem"
                        >
                            <Icon color="text.white" as={BiChevronDown} />
                        </MenuButton>

                        <MenuList
                            bgColor="primary.500"
                            marginTop={0}
                            paddingX={2}
                            paddingY={2}
                        >
                            <MenuOptionGroup
                                marginTop={0}
                                marginLeft={0}
                                defaultValue="asc"
                                title="Snap Width"
                                textColor="text.primary"

                                // paddingLe
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
                                                    props.setSnapWidthIndex(
                                                        index
                                                    )
                                                }
                                                icon={option.icon}
                                                isToggled={
                                                    index ===
                                                    props.snapWidthIndex
                                                }
                                                // borderWidth={0}
                                            />
                                        );
                                    })}
                                </ButtonGroup>
                            </MenuOptionGroup>
                        </MenuList>
                    </Menu>
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
