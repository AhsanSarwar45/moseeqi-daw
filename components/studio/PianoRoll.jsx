import { useState, useEffect, useRef } from 'react';
import { HStack, VStack, Button, Icon, Container, Box, Flex, useRadioGroup } from '@chakra-ui/react';
import AutoSizer from 'react-virtualized-auto-sizer';
import { VscClearAll } from 'react-icons/vsc';

import { StickyGrid } from '@Components/studio/StickyGrid';
import { ButtonRadio } from '@Components/ButtonRadio';
import { MusicNotes } from '@Instruments/Instruments';

const numRows = MusicNotes.length;
const colors = MusicNotes.map((x) => (x.includes('#') ? 'primary.600' : 'primary.500'));

const GridCell = ({ data, rowIndex, columnIndex, style }) => {
	const HandleOnClick = () => {
		data.onCellClick(columnIndex, rowIndex, data.divisor);
	};
	return (
		<Box
			onClick={HandleOnClick}
			bgColor={colors[rowIndex]}
			overflowX="visible"
			zIndex={500 - columnIndex}
			style={style}
			color="primary.700"
			boxShadow={columnIndex % 8 === 7 ? '1px 0 0' : '0'}
			borderColor="primary.700"
			borderBottomWidth="1px"
			borderRightWidth="1px"
			cursor="url(https://cur.cursors-4u.net/cursors/cur-11/cur1046.cur), auto"
		/>
	);
};

export const PianoRoll = ({ track, addNote, moveNote, removeNote, clearNotes, numCols }) => {
	const cellWidth = 8;
	const noteWidth = cellWidth * 8;
	const cellHeight = 6;
	const options = [ 'Whole', '1/2', '1/4', '1/8' ];

	const [ currentStepIndex, setCurrentStepIndex ] = useState(0);
	const [ noteDivisor, setNoteDivisor ] = useState(4);

	const hasScrolledRef = useRef(false);
	const gridRef = useRef(null);

	const { getRootProps, getRadioProps } = useRadioGroup({
		name: 'Note Length',
		defaultValue: '1/4',
		onChange: (value) => {
			if (value === 'Whole') {
				setNoteDivisor(1);
			} else if (value === '1/2') {
				setNoteDivisor(2);
			} else if (value === '1/4') {
				setNoteDivisor(4);
			} else if (value === '1/8') {
				setNoteDivisor(8);
			}
		}
	});

	const group = getRootProps();

	useEffect(
		() => {
			if (gridRef.current !== null && !hasScrolledRef.current) {
				gridRef.current.scrollToItem({
					columnIndex: 0,
					rowIndex: 57
				});
				hasScrolledRef.current = true;
			}
		},
		[ gridRef, gridRef.current ]
	);

	const OnKeyDown = (key) => {
		track.sampler.triggerAttack([ key ]);
	};

	const OnKeyUp = (key) => {
		track.sampler.triggerRelease([ key ]);
	};

	return (
		<Flex height="100%" flexDirection="column" width="full">
			<HStack
				w="full"
				height="20px"
				flexShrink={0}
				padding={5}
				spacing={10}
				bg="brand.primary"
				position="sticky"
				left={0}
			>
				<HStack {...group} spacing={0}>
					{options.map((value) => {
						const radio = getRadioProps({ value });
						return (
							<ButtonRadio key={value} {...radio}>
								{value}
							</ButtonRadio>
						);
					})}
				</HStack>
				<Icon as={VscClearAll} color="White" h={30} w={30} onClick={clearNotes} />
			</HStack>
			<Container
				height="full"
				width="full"
				maxWidth="full"
				margin={0}
				padding={0}
				spacing={0}
				overflowY="hidden"
				overflowX="hidden"
			>
				<AutoSizer>
					{({ height, width }) => (
						<StickyGrid
							ref={gridRef}
							height={height}
							width={width}
							columnCount={500}
							rowCount={numRows}
							rowHeight={20}
							columnWidth={60}
							stickyHeight={30}
							stickyWidth={150}
							rowHeaderLabels={MusicNotes}
							activeRowIndex={currentStepIndex}
							onKeyDown={OnKeyDown}
							onKeyUp={OnKeyUp}
							notes={track.notes}
							moveNote={moveNote}
							onFilledNoteClick={removeNote}
							itemData={{
								onCellClick: addNote,
								divisor: noteDivisor
							}}
						>
							{GridCell}
						</StickyGrid>
					)}
				</AutoSizer>
			</Container>
		</Flex>
	);
};
