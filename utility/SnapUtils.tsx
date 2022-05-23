export const Snap = (value: number, gridSize: number): number => {
    return Math.round(value / gridSize) * gridSize;
};

export const SnapUp = (value: number, gridSize: number): number => {
    return Math.ceil(value / gridSize) * gridSize;
};

export const SnapDown = (value: number, gridSize: number): number => {
    return Math.floor(value / gridSize) * gridSize;
};
