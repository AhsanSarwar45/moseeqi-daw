import { createContext, forwardRef, useRef, useEffect, ReactNode, useState, useContext } from 'react';
import { FixedSizeGrid as Grid } from 'react-window';
import { Box, Container, Flex, HStack } from '@chakra-ui/react';
import Draggable, { DraggableData, DraggableEvent } from 'react-draggable';
import { MusicNotes } from '@Instruments/Instruments';
import { CellCoordinates } from '@Interfaces/CellProps';
import { Note } from '@Interfaces/Note';
import TimeLineHandle from './TimeLineHandle';
import { Rnd } from 'react-rnd'
import Ruler from '@scena/react-ruler';
import { useTheme } from '@emotion/react';
import Theme from '@Theme/index.ts';
import { NotesModifierContext } from '@Data/NotesModifierContext';
import { GridContext } from '@Data/GridContext';
import { Part } from '@Interfaces/Part';
import PianoRollPartView from './PianoRollPartView';


const blackKeyWidth = 0.6;

const pianoOctaveStyles = [
	{
		background: 'white',
		color: 'black',
		topOffset: -0.5,
		widthModifier: 1,
		heightModifier: 2,
		alignItems: 'center'
	},
	{
		background: 'black',
		color: 'white',
		topOffset: 0,
		widthModifier: blackKeyWidth,
		heightModifier: 1,
		zIndex: 4,
		alignItems: 'center'
	},
	{
		background: 'white',
		color: 'black',

		topOffset: -0.5,
		widthModifier: 1,
		heightModifier: 1.5,
		alignItems: 'flex-end'
	},
	{
		background: 'white',
		color: 'black',
		topOffset: 0,
		widthModifier: 1,
		heightModifier: 1.5
	},
	{
		background: 'black',
		color: 'white',
		topOffset: 0,
		widthModifier: blackKeyWidth,
		heightModifier: 1,
		zIndex: 4,
		alignItems: 'center'
	},
	{
		background: 'white',
		color: 'black',
		topOffset: -0.5,
		widthModifier: 1,
		heightModifier: 2,
		alignItems: 'center'
	},
	{
		background: 'black',
		color: 'white',
		topOffset: 0,
		widthModifier: blackKeyWidth,
		heightModifier: 1,
		zIndex: 4,
		alignItems: 'center'
	},
	{
		background: 'white',
		color: 'black',
		topOffset: -0.5,
		widthModifier: 1,
		heightModifier: 1.5,
		alignItems: 'flex-end'
	},
	{
		background: 'white',
		color: 'black',
		topOffset: 0,
		widthModifier: 1,
		heightModifier: 1.5
	},
	{
		background: 'black',
		color: 'white',
		topOffset: 0,
		widthModifier: blackKeyWidth,
		heightModifier: 1,
		zIndex: 4,
		alignItems: 'center'
	},
	{
		background: 'white',
		color: 'black',
		topOffset: -0.5,
		widthModifier: 1,
		heightModifier: 2,
		alignItems: 'center'
	},
	{
		background: 'black',
		color: 'white',
		topOffset: 0,
		widthModifier: blackKeyWidth,
		heightModifier: 1,
		zIndex: 4,
		alignItems: 'center'
	}
];

const GetRenderedCursor = (children: any) =>
	children.reduce(
		([minRow, maxRow, minColumn, maxColumn]: Array<number>, { props }: { props: CellCoordinates }) => {
			if (props.rowIndex < minRow) {
				minRow = props.rowIndex;
			}
			if (props.rowIndex > maxRow) {
				maxRow = props.rowIndex;
			}
			if (props.columnIndex < minColumn) {
				minColumn = props.columnIndex;
			}
			if (props.columnIndex > maxColumn) {
				maxColumn = props.columnIndex;
			}

			return [minRow, maxRow, minColumn, maxColumn];
		},
		[Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]
	);


const ColumnsBuilder = (
	minRow: number,
	maxRow: number,
	rowHeight: number,
	stickyWidth: number,
	rowHeaderLabels: any
) => {
	const rows = [];

	for (let i = minRow; i <= maxRow; i++) {
		const styles = pianoOctaveStyles[i % 12];
		const keyHeight = rowHeight * styles.heightModifier;
		const keyWidth = stickyWidth * styles.widthModifier;
		rows.push({
			height: keyHeight,
			width: keyWidth,
			top: rowHeight * i + styles.topOffset * rowHeight,
			label: rowHeaderLabels[i],
			zIndex: styles.zIndex,
			...styles
		});
	}

	return rows;
};

interface StickHeaderProps {
	stickyHeight: number;
	stickyWidth: number;
	headerWidth: number;
	playbackState: number;
	seek: number;
	setSeek: (seek: number) => void;
}

const StickyHeader = (props: StickHeaderProps) => {
	const { gridHeight } = useContext(GridContext);

	return (
		<Flex zIndex={9001} position="sticky" top={0} left={0} overflowY="visible">
			<Box
				zIndex={1001}
				position="sticky"
				left={0}
				bgColor="primary.600"
				paddingLeft="10px"
				borderBottom="1px solid gray"
				borderRight="1px solid gray"
				width={props.stickyWidth}
				height={props.stickyHeight}
			/>
			<Box position="absolute" left={props.stickyWidth} height={props.stickyHeight} width={props.headerWidth} overflowY="visible">
				<TimeLineHandle height={gridHeight} playbackState={props.playbackState} seek={props.seek} scale={12} setSeek={props.setSeek} />
				<Ruler type="horizontal" unit={1} zoom={480} segment={4} backgroundColor={Theme.colors.primary[600]} />
			</Box>
		</Flex>
	);
};

interface StickyColumnsProps {
	stickyWidth: number;
	stickyHeight: number;
	rows: any; // TODO: remove any
	onKeyDown: (label: string) => void;
	onKeyUp: (label: string) => void;
}

const StickyColumns = (props: StickyColumnsProps) => {

	return (
		<Box
			zIndex={1000}
			left={0}
			background="primary.600"
			position="sticky"
			top={props.stickyHeight}
			width={props.stickyWidth}
			height={`calc(100% - ${props.stickyHeight}px)`}
		>
			{props.rows.map(({ label, ...style }: any, index: number) => (
				<Flex
					position="absolute"
					paddingLeft="10px"
					border="1px solid gray"
					cursor="pointer"
					userSelect="none"
					onMouseDown={() => props.onKeyDown(label)}
					onMouseUp={() => props.onKeyUp(label)}
					justifyContent="right"
					paddingRight="5px"
					borderRadius="5px"
					fontSize="xs"
					//boxShadow="lg"
					style={style}
					key={index}
				>
					{label}
				</Flex>
			))}
		</Box>
	);
};


const PianoRollGrid = forwardRef(({ children, ...rest }: any, ref) => {

	const props = useContext(GridContext);

	const [minRow, maxRow, minColumn, maxColumn] = GetRenderedCursor(children); // TODO maybe there is more elegant way to get this

	const leftSideRows = ColumnsBuilder(
		minRow,
		maxRow,
		props.rowHeight,
		props.stickyWidth,
		MusicNotes
	);
	const containerStyle = {
		...rest.style,
		width: `${parseFloat(rest.style.width) + props.stickyWidth}px`,
		height: `${parseFloat(rest.style.height) + props.stickyHeight}px`
	};
	const containerProps = { ...rest, style: containerStyle };

	return (
		<Box ref={ref} {...containerProps} bgColor="primary.600">


			<StickyHeader
				headerWidth={props.gridWidth}
				stickyHeight={props.stickyHeight}
				stickyWidth={props.stickyWidth}
				playbackState={props.playbackState}
				seek={props.seek}
				setSeek={props.setSeek}
			/>
			<StickyColumns
				rows={leftSideRows}
				stickyHeight={props.stickyHeight}
				stickyWidth={props.stickyWidth}
				onKeyDown={props.onKeyDown}
				onKeyUp={props.onKeyUp}
			/>


			<Box position="absolute" top={props.stickyHeight} left={props.stickyWidth}>
				{children}
			</Box>

			<Box position="absolute" top={props.stickyHeight} left={props.stickyWidth} zIndex={600}>
				{props.parts.map((part, partIndex) => <PianoRollPartView key={partIndex} part={part} partIndex={partIndex} />)}
			</Box>
		</Box>
	);
});

PianoRollGrid.displayName = 'PianoRollGrid';

export default PianoRollGrid;


