import React from 'react';

import { VStack, HStack } from '@chakra-ui/react';

import { Cell } from './Cell';
import { ICellDims } from '../interfaces/ICellProps';

export const Editor = () => {
	const [ numRows, setNumRows ] = React.useState(30);
	const [ numCols, setNumCols ] = React.useState(50);

	const [ activeCells, setActiveCells ] = React.useState([ [] ]);

	// const onClickHandler = ({ x, y }: ICellDims) => {
	// 	console.log('clicked %d, %d', x, y);
	// };

	return (
		<HStack spacing={0} overflow="scroll" height="100%">
			{[ ...Array(numCols) ].map((e, x) => (
				<VStack key={x} spacing={0} height="100%">
					{[ ...Array(numRows) ].map((e2, y) => (
						<Cell key={y} x={x} y={y} onClick={() => console.log('clicked %d, %d', x, y)} />
					))}
				</VStack>
			))}
		</HStack>
	);
};
