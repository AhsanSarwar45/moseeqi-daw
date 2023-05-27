export interface CellProps {
	x: number;
	y: number;
	onClick: () => void;
}

export interface CellDims {
	x: number;
	y: number;
}

export interface CellCoordinates {
	rowIndex: number;
	columnIndex: number;
}
