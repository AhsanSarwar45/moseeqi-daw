import { createContext, forwardRef, useRef, useEffect, ReactNode } from 'react';
import { FixedSizeGrid as Grid } from 'react-window';
import { Box, Container, Flex, HStack } from '@chakra-ui/react';
import Draggable, { DraggableData, DraggableEvent } from 'react-draggable';
import { MusicNotes } from '@Instruments/Instruments';
import { CellCoordinates } from '@Interfaces/CellProps';
import { Note } from '@Interfaces/Note';
import TimeLineHandle from './TimeLineHandle';

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

const HeaderBuilder = (
	minColumn: number,
	maxColumn: number,
	columnWidth: number,
	stickyHeight: number,
	activeRowIndex: number
) => {
	const columns = [];

	for (let i = minColumn; i <= maxColumn; i++) {
		columns.push({
			height: stickyHeight,
			width: columnWidth,
			left: i * columnWidth,
			first: i % 8 === 0,
			index: i,
			label: ''
		});
	}

	return columns;
};

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
	headerColumns: any; // TODO: remove any
	playbackState: number;
	seek: number;
	setSeek: (seek: number) => void;
}

const StickyHeader = (props: StickHeaderProps) => {
	return (
		<Flex zIndex={9001} position="sticky" top={0} left={0} overflow="visible">

			<Container position="absolute" height="full" paddingLeft={props.stickyWidth}>
				<TimeLineHandle playbackState={props.playbackState} seek={props.seek} scale={12} setSeek={props.setSeek} />
			</Container>
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
			<Box position="absolute" left={props.stickyWidth}>
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

interface StickyGridContextProps {
	stickyHeight: number;
	stickyWidth: number;
	columnWidth: number;
	rowHeight: number;
	rowHeaderLabels: any;
	playbackState: number;
	activeRowIndex: number;
	seek: number;
	setSeek: (seek: number) => void;
	onKeyDown: (label: string) => void;
	onKeyUp: (label: string) => void;
	moveNote: (index: number, column: number, row: number) => void;
	onFilledNoteClick: (index: number) => void;
	notes: Array<Note>;
	children?: ReactNode;
	columnCount?: number;
	rowCount?: number;
	height?: number;
	width?: number;
	itemData?: any;
}

const StickyGridContext = createContext<StickyGridContextProps>({
	stickyHeight: 0,
	stickyWidth: 0,
	columnWidth: 0,
	rowHeight: 0,
	playbackState: 0,
	rowHeaderLabels: null as any,
	activeRowIndex: 0,
	seek: 0,
	setSeek: (seek: number) => { },
	onKeyDown: (label: string) => { },
	onKeyUp: (label: string) => { },
	moveNote: (index: number, column: number, row: number) => { },
	onFilledNoteClick: (index: number) => { },
	notes: [] as Array<Note>

});
StickyGridContext.displayName = 'StickyGridContext';

interface FilledCellProps {
	note: Note;
	index: number;
	rowHeight: number;
	onClick: (index: number) => void;
	onDrag: (index: number, column: number, row: number) => void;
}

const FilledCell = (props: FilledCellProps) => {
	const handleRef = useRef<HTMLElement | null>(null);
	const dragging = useRef(false);

	const HandleDrag = (event: DraggableEvent, data: DraggableData) => {
		console.log(data.lastX / 60, data.lastY / props.rowHeight);
		props.onDrag(props.index, data.lastX / 60, data.lastY / props.rowHeight);
		dragging.current = false;
	};

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
		<Draggable
			handle={`.cellHandle${props.note.time}${props.note.noteIndex}`}
			defaultPosition={{ x: props.note.time * 60, y: props.note.noteIndex * props.rowHeight }}
			position={
				dragging.current ? null as any : { x: props.note.time * 60, y: props.note.noteIndex * props.rowHeight }
			}
			grid={[60, props.rowHeight]}
			scale={1}
			onStart={() => {
				dragging.current = true;
			}}
			onStop={HandleDrag}
			nodeRef={handleRef}
		>
			<Box
				ref={handleRef as any}
				className={`cellHandle${props.note.time}${props.note.noteIndex}`}
				// cursor="url(https://icons.iconarchive.com/icons/fatcow/farm-fresh/32/draw-eraser-icon.png) -80 40, auto"
				cursor="move"
				//key={index}
				height={`${props.rowHeight - 1}px`}
				position="absolute"
				//left={`${note.time * 60}px`}
				//top={`${note.noteIndex * rowHeight}px`}
				width={`${8 / props.note.duration * 60 - 1}px`}
				borderRadius="5px"
				borderWidth="1px"
				borderColor="secondary.700"
				bgColor="secondary.500"
				onContextMenu={() => {
					props.onClick(props.index);
					return false;
				}}
			//onClick={() => onClick(index)}
			>
				{/* {`${index} ${note.time} ${MusicNotes[note.noteIndex]}`} */}
			</Box>
		</Draggable>
	);
};

const InnerGridElementType = forwardRef(({ children, ...rest }: any, ref) => (
	<StickyGridContext.Consumer>
		{(props: StickyGridContextProps) => {
			const [minRow, maxRow, minColumn, maxColumn] = GetRenderedCursor(children); // TODO maybe there is more elegant way to get this
			const headerColumns = HeaderBuilder(
				minColumn,
				maxColumn,
				props.columnWidth,
				props.stickyHeight,
				props.activeRowIndex
			);
			const leftSideRows = ColumnsBuilder(
				minRow,
				maxRow,
				props.rowHeight,
				props.stickyWidth,
				props.rowHeaderLabels
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
						headerColumns={headerColumns}
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
						{props.notes.map((note: Note, index: number) => (
							<FilledCell
								key={index}
								note={note}
								index={index}
								rowHeight={props.rowHeight}
								onClick={props.onFilledNoteClick}
								onDrag={props.moveNote}
							/>
						))}
					</Box>
				</Box>
			);
		}}
	</StickyGridContext.Consumer>
));

InnerGridElementType.displayName = 'InnerGridElementType';

export const StickyGrid = forwardRef((
	{
		stickyHeight,
		stickyWidth,
		columnWidth,
		rowHeight,
		rowHeaderLabels,
		activeRowIndex,
		onKeyDown,
		onKeyUp,
		playbackState,
		seek,
		setSeek,
		notes,
		moveNote,
		onFilledNoteClick,
		children,
		...rest
	}: StickyGridContextProps,
	ref
) => (
	<StickyGridContext.Provider
		value={{
			stickyHeight,
			stickyWidth,
			columnWidth,
			rowHeight,
			rowHeaderLabels,
			activeRowIndex,
			onKeyDown,
			onKeyUp,
			playbackState,
			seek,
			setSeek,
			notes,
			moveNote,
			onFilledNoteClick,
		}}
	>
		<Grid
			ref={ref as any}

			columnWidth={columnWidth}
			rowHeight={rowHeight}
			innerElementType={InnerGridElementType}
			{...rest as any}
		>
			{children as any}
		</Grid>
	</StickyGridContext.Provider>
));

StickyGrid.displayName = 'StickyGrid';
