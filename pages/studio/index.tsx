import { NextPage } from 'next';
import { Box, Spacer, Flex, Container, VStack, HStack, ButtonGroup, Button } from '@chakra-ui/react';
import { PlayBackController } from '../../src/components/studio/PlaybackController';
import { StudioEditBar } from '../../src/components/studio/StudioEditBar';
import { Editor } from '../../src/components/studio/Editor';

const Studio: NextPage = () => {
	return (
		<Flex flex="1 1 auto" id="Window" direction="column" height="calc(100% - 40px)" width="100%" overflow="hidden">
			<StudioEditBar />
			<Editor />

			<PlayBackController />
		</Flex>
	);
};

export default Studio;
