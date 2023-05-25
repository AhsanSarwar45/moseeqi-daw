export const snap = (value: number, gridSize: number): number => {
    return Math.round(value / gridSize) * gridSize;
};

export const snapUp = (value: number, gridSize: number): number => {
    return Math.ceil(value / gridSize) * gridSize;
};

export const snapDown = (value: number, gridSize: number): number => {
    return Math.floor(value / gridSize) * gridSize;
};
