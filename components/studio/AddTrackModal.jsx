import React, { useState } from 'react';
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
	Select
} from '@chakra-ui/react';

import { Instruments } from '@Instruments/Instruments';

export const AddTrackModal = ({ onClose, isOpen, onSubmit }) => {
	const [ selectedInstrument, setInstrument ] = useState(null);

	return (
		<Modal isCentered onClose={onClose} isOpen={isOpen} motionPreset="slideInBottom">
			<ModalOverlay />
			<ModalContent>
				<ModalHeader>Add Track</ModalHeader>
				<ModalCloseButton />
				<ModalBody>
					<Text>Select Instrument</Text>
					<Select
						placeholder="Select Instrument"
						onChange={(event) => {
							setInstrument(event.target.selectedOptions[0].value);
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
							if (selectedInstrument === '') return;
							onSubmit(selectedInstrument);
							//console.log(onClose);
							onClose();
							setInstrument(null);
						}}
					>
						Add
					</Button>
					<Button variant="ghost" onClick={onClose}>
						Cancel
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
};
