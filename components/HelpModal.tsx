import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    Text,
    Heading,
    Button,
} from "@chakra-ui/react";

interface HelpModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const HelpModal = (props: HelpModalProps) => {
    return (
        <Modal
            isCentered
            onClose={props.onClose}
            isOpen={props.isOpen}
            motionPreset="slideInBottom"
        >
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Help</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Heading>Piano Roll</Heading>
                    <Text>
                        THe piano roll is the panel at the bottom of the window
                    </Text>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};

export default HelpModal;
