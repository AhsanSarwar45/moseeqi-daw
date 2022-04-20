import { ButtonGroup, Button, HStack, Heading, IconButton } from '@chakra-ui/react';
import {
	NumberInput,
	NumberIncrementStepper,
	NumberDecrementStepper,
	NumberInputField,
	NumberInputStepper
} from '@chakra-ui/number-input';
import { TiMediaPlay, TiMediaRewind, TiMediaFastForward, TiMediaPause, TiMediaStop } from 'react-icons/ti';

export const PlayBackController = ({ playbackState, setPlaybackState, setBPM }) => {
	return (
		<HStack
			height="20px"
			width="full"
			flexShrink={0}
			padding={5}
			spacing={5}
			bg="brand.primary"
			justifyContent="center"
		>
			<ButtonGroup size="sm" isAttached variant="solid" colorScheme="secondary">
				<IconButton aria-label="rewind" icon={<TiMediaRewind />} borderWidth={1} borderColor="secondary.700" />
				<IconButton
					aria-label="play"
					icon={<TiMediaPlay />}
					borderWidth={1}
					isDisabled={playbackState === 1}
					borderColor="secondary.700"
					onClick={() => setPlaybackState(1)}
				/>
				<IconButton
					aria-label="pause"
					icon={<TiMediaPause />}
					borderWidth={1}
					isDisabled={playbackState === 2}
					borderColor="secondary.700"
					onClick={() => setPlaybackState(2)}
				/>
				<IconButton
					aria-label="stop"
					icon={<TiMediaStop />}
					borderWidth={1}
					isDisabled={playbackState === 0}
					borderColor="secondary.700"
					onClick={() => setPlaybackState(0)}
				/>
				<IconButton
					aria-label="fast-forward"
					icon={<TiMediaFastForward />}
					borderWidth={1}
					borderColor="secondary.700"
				/>
			</ButtonGroup>

			<NumberInput
				allowMouseWheel
				size="sm"
				textColor="white"
				borderColor="secondary.700"
				borderWidth="2px"
				maxWidth={20}
				min={30}
				max={600}
				defaultValue={120}
				borderRadius="full"
				onChange={(s, n) => {
					setBPM(n);
				}}
			>
				<NumberInputField borderRadius="full" />
				<NumberInputStepper>
					<NumberIncrementStepper borderColor="secondary.700" borderTopRightRadius="full" />
					<NumberDecrementStepper borderColor="secondary.700" borderBottomRightRadius="full" />
				</NumberInputStepper>
			</NumberInput>
		</HStack>
	);
};
