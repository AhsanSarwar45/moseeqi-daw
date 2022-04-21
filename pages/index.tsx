import { NextPage } from 'next';
import NextLink from 'next/link';
import { Navbar } from '@Components/NavBar';
import { Box, Button, Container, Flex, Link, VStack } from '@chakra-ui/react';
import MoseeqiLogo from '@Logos/MoseeqiLogo.svg';
import { useTheme } from '@chakra-ui/react'

const Landing: NextPage = () => {
	const theme = useTheme()

	return (
		<VStack gap="5%" bgColor="primary.500" width="full" height="100%" padding={0} alignItems="center" justifyContent="center">
			const theme = useTheme()
			<MoseeqiLogo width="10%" stroke={theme.colors.brand.secondary} fill="none" />
			<NextLink href={'/studio'}><Link fontSize={24} textColor="white">Enter Studio</Link></NextLink>
		</VStack >
	);
};

export default Landing;
