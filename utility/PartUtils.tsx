export const GetNewPartStartColumn = (noteStartColumn: number) => {
    return Math.floor(noteStartColumn / 8) * 8;
};

export const GetNewPartStopColumn = (noteStopColumn: number) => {
    return Math.ceil(noteStopColumn / 8) * 8;
};
