import Link from 'next/link';
import { Spacer, Button, HStack, Heading } from '@chakra-ui/react';

export const NavBar = () => {
	return (
		<HStack w="full" pr={10} pt={5} pb={5} pl={10} spacing={10} bg="brand.primary">
			<Spacer />
			<Heading textColor="white" size="sm">
				Feed
			</Heading>
			<Heading textColor="white" size="sm">
				Discover
			</Heading>
			<Link href="/studio">
				<a>
					<Heading textColor="white" size="sm">
						Studio
					</Heading>
				</a>
			</Link>
			<Heading textColor="white" size="sm">
				About
			</Heading>
			<Heading textColor="white" size="sm">
				Login
			</Heading>
			<Link href="/signup">
				<a>
					<Button colorScheme="secondary" textColor="white" size="sm">
						SIGN UP
					</Button>
				</a>
			</Link>
		</HStack>
	);
};
