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


	return (
		<Flex zIndex={9001} position="sticky" top={0} left={0} overflowY="visible">

			{/* <Container position="absolute" height="full" paddingLeft={props.stickyWidth}>
				<TimeLineHandle playbackState={props.playbackState} seek={props.seek} scale={12} setSeek={props.setSeek} />
			</Container> */}
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
				<TimeLineHandle playbackState={props.playbackState} seek={props.seek} scale={12} setSeek={props.setSeek} />
				<Ruler type="horizontal" unit={1} zoom={480} segment={4} backgroundColor={Theme.colors.primary[600]} />
			</Box>
			{/* <Box position="absolute" left={props.stickyWidth}>
				{props.headerColumns.map(({ label, ...style }: any, index: number) => (
					<Flex
						color="white"
						justifyContent="center"
						alignItems="center"
						bgColor={style.first ? 'brand.accent2' : 'brand.accent1'}
						position="absolute"
						borderBottom="1px solid gray"
						borderRight="1px solid gray"
						style={style}
						key={index}
					>
						{style.first ? style.index / 8 + 1 : ''}
					</Flex>
				))}
			</Box> */}
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
	// console.log(onClickCallback);
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



interface FilledCellProps {
	note: Note;
	part: Part;
	partIndex: number;
	noteIndex: number;
	cellHeight: number;
	cellWidth: number;
	onClick: (key: string, duration: number) => void;
}

const FilledCell = (props: FilledCellProps) => {
	const { onMoveNote, onRemoveNote, onResizeNote } = useContext(NotesModifierContext);
	const [activeWidth, setActiveWidth] = useState(8 / props.note.duration * props.cellWidth - 1);

	const handleRef = useRef<HTMLElement | null>(null);

	useEffect(() => {
		handleRef.current?.addEventListener(
			'contextmenu',
			function (event: any) {
				event.preventDefault();
				return false;
			},
			false
		);
	}, []);

	return (
		<Rnd
			size={{ width: activeWidth, height: props.cellHeight - 1 }}
			enableResizing={{ top: false, right: true, bottom: false, left: false, topRight: false, bottomRight: false, bottomLeft: false, topLeft: false }}
			// bounds="parent"
			resizeGrid={[props.cellWidth, props.cellHeight - 1]}
			dragGrid={[props.cellWidth, props.cellHeight]}
			position={{ x: props.note.time * props.cellWidth, y: props.note.noteIndex * props.cellHeight }}
			onDragStop={(event, data) => {
				// Round off data.x to nearest cellWidth
				data.lastX = Math.round(data.lastX / props.cellWidth) * props.cellWidth;
				// Round off data.y to nearest cellHeight
				data.lastY = Math.round(data.lastY / props.cellHeight) * props.cellHeight;

				const localColumn = data.lastX / props.cellWidth;
				let column = localColumn + props.part.startTime * 4;
				const row = data.lastY / props.cellHeight;

				console.log(column, props.part.startTime);

				if (column < 0) {
					column = 0;
				}
				if (column < 0) {
					column = 0;
				}

				onMoveNote(props.partIndex, props.noteIndex, column, row);

			}}
			minWidth={props.cellWidth - 1}
			onResizeStop={(e, direction, ref, delta, position) => {
				const width = parseInt(ref.style.width)

				setActiveWidth(width - 1);
				const duration = 8 / (width) * props.cellWidth
				// console.log("width", width, "position", position);
				onResizeNote(props.partIndex, props.noteIndex, duration);
				// props.onClick(props.note.note, duration)

			}}
		>
			<Box
				pointerEvents="auto"
				ref={handleRef as any}
				// className={`cellHandle${props.note.time}${props.note.noteIndex}`}
				// cursor="url(https://icons.iconarchive.com/icons/fatcow/farm-fresh/32/draw-eraser-icon.png) -80 40, auto"
				cursor="move"
				height="full"
				borderRadius="5px"
				borderWidth="1px"
				borderColor="secondary.700"
				bgColor="secondary.500"
				onContextMenu={() => {
					onRemoveNote(props.partIndex, props.noteIndex);
					return false;
				}}
				zIndex={9999}
			// onClick={() => props.onClick(props.note.note, props.note.duration)}
			>
				{/* {`${index} ${note.time} ${MusicNotes[note.noteIndex]}`} */}
			</Box>
		</Rnd>
	);
};

const PianoRollGrid = forwardRef(({ children, ...rest }: any, ref) => (
	<GridContext.Consumer>
		{(props) => {

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
						headerWidth={props.columnHeaderWidth as number}
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
						{props.parts.map((part, partIndex) => (
							// <Box key={partIndex} >

							<Box borderWidth={1} zIndex={9998} key={partIndex} position="absolute" pointerEvents="none" left={part.startTime * 240} width={(part.stopTime - part.startTime) * 240} height={2000} bgColor="rgba(255,0,0,0.1)">

								{part.notes.map((note: Note, noteIndex: number) => (
									<FilledCell
										key={noteIndex + partIndex * part.notes.length}
										note={note}
										noteIndex={noteIndex}
										part={part}
										partIndex={partIndex}
										cellHeight={props.rowHeight}
										cellWidth={props.columnWidth}
										onClick={props.onFilledNoteClick}
									/>
								))}
							</Box>
						))
						}

					</Box>
				</Box>
			);
		}}
	</GridContext.Consumer>
));

PianoRollGrid.displayName = 'PianoRollGrid';

export default PianoRollGrid;


