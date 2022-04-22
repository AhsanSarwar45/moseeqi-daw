import { useState, useEffect, useRef, memo } from 'react';
import { HStack, VStack, Button, Icon, Container, Box, Flex, useRadioGroup } from '@chakra-ui/react';
import AutoSizer from 'react-virtualized-auto-sizer';
import { VscClearAll } from 'react-icons/vsc';
import { FixedSizeGrid as Grid } from 'react-window';

import { StickyGrid } from '@Components/studio/StickyGrid';
import { ButtonRadio } from '@Components/ButtonRadio';
import { MusicNotes } from '@Instruments/Instruments';
import { Track } from '@Interfaces/Track';
import TimeLineHandle from './TimeLineHandle';

const numRows = MusicNotes.length;
const colors = MusicNotes.map((x) => (x.includes('#') ? 'primary.600' : 'primary.500'));

interface GridCellProps {
	data: any; // TODO: Remove any
	rowIndex: number;
	columnIndex: number;
	style: any; // TODO: Remove any
}

const GridCell = memo((props: GridCellProps) => {
	const HandleOnClick = () => {
		props.data.onCellClick(props.columnIndex, props.rowIndex, props.data.divisor);
	};
	return (
		<Box
			onClick={HandleOnClick}
			bgColor={colors[props.rowIndex]}
			overflowX="visible"
			zIndex={500 - props.columnIndex}
			style={props.style}
			boxShadow={props.columnIndex % 8 === 7 ? '1px 0 0' : '0'}
			borderColor="primary.700"
			borderBottomWidth="1px"
			borderRightWidth="1px"
			cursor="url(https://cur.cursors-4u.net/cursors/cur-11/cur1046.cur), auto"
		/>
	);
});

GridCell.displayName = 'GridCell';

interface PianoRollProps {
	track: Track;
	seek: number;
	setSeek: (seek: number) => void;
	playbackState: number;
	addNote: (column: number, row: number, divisor: number) => void;
	moveNote: (index: number, column: number, row: number) => void;
	removeNote: (index: number) => void;
	clearNotes: () => void;
	numCols?: number;
}

const PianoRoll = memo((props: PianoRollProps) => {
	const cellWidth = 8;
	const noteWidth = cellWidth * 8;
	const cellHeight = 6;
	const options = ['Whole', '1/2', '1/4', '1/8'];


	const [noteDivisor, setNoteDivisor] = useState(4);

	const hasScrolledRef = useRef(false);
	const gridRef = useRef<Grid<any>>(null);

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
		[gridRef]
	);

	const OnKeyDown = (key: string) => {
		props.track.sampler.triggerAttack([key]);
	};

	const OnKeyUp = (key: string) => {
		props.track.sampler.triggerRelease([key]);
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
				<Icon as={VscClearAll} color="White" h={30} w={30} onClick={props.clearNotes} />
			</HStack>
			<Container
				margin={0}
				padding={0}
				height="full"
				width="full"
				maxWidth="full"
				overflowY="hidden"
				overflowX="hidden"
			>



				<AutoSizer>

					{({ height, width }: { height: number; width: number }) => (

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
							seek={props.seek}
							setSeek={props.setSeek}
							playbackState={props.playbackState}
							rowHeaderLabels={MusicNotes}
							activeRowIndex={1}
							onKeyDown={OnKeyDown}
							onKeyUp={OnKeyUp}
							notes={props.track.notes}
							moveNote={props.moveNote}
							onFilledNoteClick={props.removeNote}
							itemData={{
								onCellClick: props.addNote,
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
});

PianoRoll.displayName = 'PianoRoll';

export default PianoRoll;