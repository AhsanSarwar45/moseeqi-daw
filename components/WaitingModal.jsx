import {
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalFooter,
	ModalBody,
	ModalCloseButton,
	Spinner,
	HStack,
	Text
} from '@chakra-ui/react';

export const WaitingModal = ({ isOpen, onClose }) => {
	return (
		<Modal closeOnOverlayClick={false} isOpen={isOpen} onClose={onClose} size="sm" isCentered>
			<ModalOverlay />
			<ModalContent width="fit-content">
				<ModalBody p={6} bgColor="brand.primary">
					<HStack sapcing={10}>
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
