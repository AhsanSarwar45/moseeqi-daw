import { Box, useRadio } from '@chakra-ui/react';

export const ButtonRadio = (props) => {
	const { getInputProps, getCheckboxProps } = useRadio(props);

	const input = getInputProps();
	const checkbox = getCheckboxProps();

	return (
		<Box as="label">
			<input {...input} />
			<Box
				{...checkbox}
				cursor="pointer"
				borderWidth="1px"
				borderColor="secondary.700"
				_checked={{
					bg: 'secondary.500',
					color: 'white'
				}}
				padding={1}
				textColor="white"
				fontSize="sm"
			>
				{props.children}
			</Box>
		</Box>
	);
};
