import { Box } from '@chakra-ui/react';
import React from 'react';
import { ICellProps } from '../interfaces/ICellProps';
import { useBoolean } from '@chakra-ui/hooks';

export const Cell = ({ x, y, onClick }: ICellProps) => {
	const [ isActive, setActive ] = useBoolean(false);

	const onClickHandler = () => {
		onClick();
		setActive.toggle();
	};

	return (
		<Box
			w="50px"
			minHeight="32px"
			bg={isActive ? 'secondary.500' : y % 2 == 0 ? 'primary.400' : 'primary.600'}
			borderWidth="1px"
			borderColor="primary.100"
			onClick={onClickHandler}
		/>
	);
};
