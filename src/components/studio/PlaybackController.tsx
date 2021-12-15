import { ButtonGroup, Button, HStack, Heading } from '@chakra-ui/react';
import MIDISounds from 'midi-sounds-react';

export const PlayBackController = () => {
	const playTestInstrument = () => {
		//midiSounds.playChordNow(3, [60], 2.5);
	};
	return (
		<HStack position="fixed" bottom="0px" h="20px" w="full" padding={5} spacing={10} bg="brand.primary">
			<ButtonGroup size="sm" isAttached variant="solid">
				<Button colorScheme="secondary" onClick={playTestInstrument}>
					Play
				</Button>
				<Button colorScheme="secondary">Stop</Button>
			</ButtonGroup>
		</HStack>
	);
};
