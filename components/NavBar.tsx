import NextLink from 'next/link';

import {
	Box,
	Flex,
	Text,
	Button,
	Stack,
	Icon,
	Spacer,
	Popover,
	PopoverTrigger,
	PopoverContent
} from '@chakra-ui/react';
import { ChevronRightIcon } from '@chakra-ui/icons';

import { NavBarProps } from '../interfaces/NavBarProps';

export const Navbar = () => {
	return (
		<Box>
			<Flex
				bg="brand.primary"
				minH={'60px'}
				position="fixed"
				top={0}
				w="full"
				py={{ base: 2 }}
				px={{ base: 4 }}
				align={'center'}
				justify="space-between"
				paddingX="20%"
				paddingY={5}
			>
				<Text textColor="white" fontFamily={'heading'}>
					moseeqi
				</Text>

				<NavbarItems />

				<Stack flex={{ base: 1, md: 0 }} justify={'flex-end'} direction={'row'} spacing={5}>
					<NextLink href="/login">
						<a>
							<Button colorScheme="secondary" variant="outline" size="sm" textColor="white ">
								Login
							</Button>
						</a>
					</NextLink>
					<NextLink href="/signup">
						<a>
							<Button colorScheme="secondary" size="sm" textColor="white ">
								Sign Up
							</Button>
						</a>
					</NextLink>
				</Stack>
			</Flex>
		</Box>
	);
};

const NavbarItems = () => {
	return (
		<Stack direction={'row'} spacing={10}>
			{NAV_ITEMS.map((navItem) => (
				<Box key={navItem.label}>
					<Popover trigger={'hover'} placement={'bottom-start'}>
						<NextLink href={navItem.href ? navItem.href : '#'}>
							<a>
								<PopoverTrigger>
									<Text
										p={2}
										color="white"
										fontSize={'sm'}
										fontWeight={500}
										_hover={{
											textDecoration: 'none',
											color: 'secondary.300'
										}}
									>
										{navItem.label}
									</Text>
								</PopoverTrigger>
							</a>
						</NextLink>

						{navItem.children && (
							<PopoverContent
								border={0}
								boxShadow={'lg'}
								color="white"
								bg="brand.secondary"
								p={4}
								rounded={'xl'}
								minW={'sm'}
							>
								<Stack>
									{navItem.children.map((child) => <SubNavBar key={child.label} {...child} />)}
								</Stack>
							</PopoverContent>
						)}
					</Popover>
				</Box>
			))}
		</Stack>
	);
};

const SubNavBar = ({ label, href, subLabel }: NavBarProps) => {
	return (
		<NextLink href={href}>
			<a>
				<Text role={'group'} display={'block'} p={2} rounded={'md'} _hover={{ bg: 'brand.accent1' }}>
					<Stack direction={'row'} align={'center'}>
						<Box>
							<Text transition={'all .3s ease'} _groupHover={{ color: 'white' }} fontWeight={500}>
								{label}
							</Text>
							<Text fontSize={'sm'} color="white">
								{subLabel}
							</Text>
						</Box>
						<Flex
							transition={'all .3s ease'}
							transform={'translateX(-10px)'}
							opacity={0}
							_groupHover={{ opacity: '100%', transform: 'translateX(0)' }}
							justify={'flex-end'}
							align={'center'}
							flex={1}
						>
							<Icon color="brand.secondary" w={5} h={5} as={ChevronRightIcon} />
						</Flex>
					</Stack>
				</Text>
			</a>
		</NextLink>
	);
};

const NAV_ITEMS = [
	{
		label: 'Explore',
		children: [
			{
				label: 'Music',
				subLabel: 'Trending Music to inspire you',
				href: '#'
			},
			{
				label: 'Artists',
				subLabel: 'Established and up-and-coming Artists',
				href: '#'
			}
		]
	},
	{
		label: 'About',
		children: [
			{
				label: 'Moseeqi',
				subLabel: 'Find the goal of this platform',
				href: '#'
			},
			{
				label: 'Who we are',
				subLabel: 'Get to know the team behind Moseeqi',
				href: '#'
			}
		]
	},
	{
		label: 'Studio',
		href: '/studio'
	}
];
