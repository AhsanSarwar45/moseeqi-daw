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
    Select,
} from "@chakra-ui/react";

import { Instruments } from "@Instruments/Instruments";

interface AddTrackModalProps {
    onClose: () => void;
    isOpen: boolean;
    onSubmit: Function;
}

export const AddTrackModal = (props: AddTrackModalProps) => {
    const [selectedInstrument, setSelectedInstrument] = useState("");

    return (
        <Modal
            isCentered
            onClose={props.onClose}
            isOpen={props.isOpen}
            motionPreset="slideInBottom"
        >
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Add Track</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Text>Select Instrument</Text>
                    <Select
                        placeholder="Select Instrument"
                        onChange={(event) => {
                            setSelectedInstrument(
                                event.target.selectedOptions[0].value
                            );
                        }}
                    >
                        {Instruments.map((instrument, index) => (
                            <option key={index} value={index}>
                                {instrument.name}
                            </option>
                        ))}
                    </Select>
                </ModalBody>
                <ModalFooter>
                    <Button
                        type="submit"
                        colorScheme="secondary"
                        mr={3}
                        onClick={() => {
                            if (selectedInstrument === "") return;
                            props.onSubmit(selectedInstrument);
                            //console.log(onClose);
                            props.onClose();
                            setSelectedInstrument("");
                        }}
                    >
                        Add
                    </Button>
                    <Button variant="ghost" onClick={props.onClose}>
                        Cancel
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};
