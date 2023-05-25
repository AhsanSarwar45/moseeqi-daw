import React, { useState } from "react";
import {
    Button,
    Text,
    Box,
    VStack,
    Modal,
    ModalBody,
    ModalContent,
    ModalCloseButton,
    ModalFooter,
    ModalOverlay,
    ModalHeader,
    useDisclosure,
    useTheme,
    Select,
} from "@chakra-ui/react";

import { Instruments } from "@Instruments/Instruments";
import { ScrollbarStyle } from "@Styles/ScrollbarStyle";

interface addTrackModalProps {
    onClose: () => void;
    isOpen: boolean;
    onSubmit: (option: number) => void;
}

export const AddTrackModal = (props: addTrackModalProps) => {
    const theme = useTheme();
    const [selectedInstrument, setSelectedInstrument] = useState(0);

    return (
        <Modal
            isCentered
            onClose={props.onClose}
            isOpen={props.isOpen}
            motionPreset="slideInBottom"
        >
            <ModalOverlay />
            <ModalContent bgColor="primary.500">
                <ModalHeader textColor="text.primary">add Track</ModalHeader>
                <ModalCloseButton color="text.primary" />
                <ModalBody>
                    <Text>Select Instrument</Text>
                    <Select
                        marginY={"0.5rem"}
                        color="text.primary"
                        // placeholder="Select Instrument"
                        defaultValue={0}
                        onChange={(event) => {
                            setSelectedInstrument(
                                parseInt(event.target.selectedOptions[0].value)
                            );
                        }}
                        sx={ScrollbarStyle}
                    >
                        {Instruments.map((instrument, index) => (
                            <option
                                style={{
                                    backgroundColor: theme.colors.primary[500],
                                    color: "white",
                                }}
                                key={index}
                                value={index}
                            >
                                {instrument.name}
                            </option>
                        ))}
                    </Select>
                </ModalBody>
                <ModalFooter>
                    <Button
                        variant="ghost"
                        onClick={props.onClose}
                        textColor="text.primary"
                        _hover={{
                            bgColor: "primary.600",
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        colorScheme="secondary"
                        mr={3}
                        onClick={() => {
                            props.onSubmit(selectedInstrument);
                            props.onClose();
                            setSelectedInstrument(0);
                        }}
                    >
                        Add
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};
