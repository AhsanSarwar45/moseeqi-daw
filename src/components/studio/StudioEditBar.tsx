import { ButtonGroup, Button, HStack } from '@chakra-ui/react';

export const StudioEditBar = () => {
	return (
		<HStack id="EditBar" w="full" h="20px" padding={5} spacing={10} bg="brand.primary">
			<Button colorScheme="secondary" size="sm">
				Draw
			</Button>
		</HStack>
	);
};
