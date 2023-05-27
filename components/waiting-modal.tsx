import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalBody,
    Spinner,
    HStack,
    Text,
    useDisclosure,
} from "@chakra-ui/react";
import { selectIsLoading, useLoadingStore } from "@data/stores/loading-status";
import { useEffect } from "react";

const WaitingModal = () => {
    const { isOpen, onOpen, onClose } = useDisclosure();

    useEffect(
        () =>
            useLoadingStore.subscribe(selectIsLoading, (isLoading) => {
                if (isLoading) {
                    onOpen();
                } else {
                    onClose();
                }
            }),
        []
    );

    useEffect(() => {
        if (useLoadingStore.getState().isLoading) {
            onOpen();
        }
    }, [onOpen]);

    return (
        <Modal
            closeOnOverlayClick={false}
            isOpen={isOpen}
            onClose={onClose}
            size="sm"
            isCentered
        >
            <ModalOverlay />
            <ModalContent width="fit-content">
                <ModalBody p={6} bgColor="brand.primary">
                    <HStack spacing={6}>
                        <Spinner
                            thickness="4px"
                            speed="0.75s"
                            emptyColor="brand.accent1"
                            color="brand.secondary"
                            size="xl"
                        />
                        <Text color="white">Loading Instruments...</Text>
                    </HStack>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};

export default WaitingModal;
